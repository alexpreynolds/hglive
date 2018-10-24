var express = require('express');
var fileUpload = require('express-fileupload');
var router = express.Router({ strict: true });
var fs = require('fs');
var util = require('util');
var uuidv4 = require('uuid/v4');
var spawn = require('child_process').spawn;
var path = require('path');
var cors = require('cors');
var constants = require('../constants');

// default options
router.use(cors());
router.use(fileUpload({
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: false,
  abortOnLimit: true,
  limits: { fileSize: 1024 * 1024 }
}));

router.get('/', function(req, res, next) {
  return res.status(400).send('No files were specified.');
});

router.post('/', function(req, res) {  
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
    
  let coordsFile = req.files.coordsFn;  
  if (!coordsFile) {
    coordsFile = req.files.file;
  }

  // Set up destination filename and folder, if necessary
  var id = uuidv4();
  var destDir = path.join(constants.ASSETS, id);
  if (!fs.existsSync(constants.ASSETS)) {
    fs.mkdirSync(constants.ASSETS);
  }
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
  }

  // Use the mv() method to place the file on the server
  var destCoordsBedFn = path.join(destDir, 'coordinates.bed');
  var writeBedCoordinatesPromise = coordsFile.mv(destCoordsBedFn)
    .then(function() {
      return "[" + id + "] wrote BED coordinates";
    })
    .catch(function(err) {
      if (err)
        return err;
    });
    
  // Convert BED to JSON object
  var coords = [];
  var coordsObj = {};
  var fsReadFilePromisified = util.promisify(fs.readFile);
  var convertBedToJSONAndWriteJSONPromise = fsReadFilePromisified(destCoordsBedFn, {encoding: 'utf8'})
    .then(function(data) {
      var lines = data.replace(/\/r/g, '').split('\n');
      lines.forEach(function(row) {
        if (row.length > 0) {
          var elems = row.split('\t');
          var chr = elems[0];
          var start = parseInt(elems[1]);
          var stop = parseInt(elems[2]);
          var idval = elems[3] || '';
          var item = {
            chr: chr,
            start: start,
            stop: stop,
            id: idval
          };
          coords.push(item);
        }
      });
      var destCoordsJsonFn = path.join(destDir, 'coordinates.json');
      coordsObj.id = id;
      coordsObj.coords = coords;
      coordsObj.paddingMidpoint = parseInt(req.body.paddingMidpoint) || 0;
      coordsObj.build = req.body.build || null;
      coordsObj.hgViewconfEndpointURL = req.body.hgViewconfEndpointURL || null;
      coordsObj.hgViewconfId = req.body.hgViewconfId || null;
      coordsObj.coordTableIsOpen = req.body.coordTableIsOpen || true;
      fs.writeFileSync(destCoordsJsonFn, JSON.stringify(coordsObj, null, 2));
      return "[" + id + "] converted BED to JSON";
    })
    .catch(function(err) {
      if (err)
        return err;
    });
      
  // Resolve all promises
  Promise.all([writeBedCoordinatesPromise, convertBedToJSONAndWriteJSONPromise])
    .then(function(values) {
      console.log(values);
    })
    .catch(function(errs) {
      console.log('upload errors:', errs);
      return res.status(500).send(errs);
    })
    .finally(function() {
      // Redirect client 
      console.log('redirecting...');
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify(coordsObj));
    });
});

module.exports = router;