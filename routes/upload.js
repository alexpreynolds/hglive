var express = require('express');
var fileUpload = require('express-fileupload');
var router = express.Router({ strict: true });
var fs = require('fs');
var util = require('util');
var constants = require('../constants');
var uuidv4 = require('uuid/v4');
var spawn = require('child_process').spawn;
var path = require('path');
var cors = require('cors');

// default options
router.use(cors());
router.use(fileUpload({
  createParentPath: true,
  safeFileNames: true,
  preserveExtension: false,
  abortOnLimit: true,
  limits: { fileSize: 1024 * 1024 }
}));

router.get('/', cors(), function(req, res, next) {
  return res.status(400).send('No files were specified.');
});

router.post('/', cors(), function(req, res) {	
  if (!req.files) {
    return res.status(400).send('No files were uploaded.');
  }
    
  let coordsFn = req.files.coordsFn;  
  if (!coordsFn) {
    coordsFn = req.files.file;
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
  var destCoordsFn = path.join(destDir, 'coordinates.bed');
  var destCoordsFnPromise = coordsFn.mv(destCoordsFn)
	.then(function() {
    return "[" + id + "] copied coordinates";
	})
	.catch(function(err) {
    if (err)
      return err;
	});

    // Resolve all promises    
  console.log('process.env.HOST, constants.HOST:', process.env.HOST, constants.HOST);
  Promise.all([destCoordsFnPromise])
	.then(function(values) {
    // Log actions
    console.log('logging actions...');
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
    res.send(JSON.stringify({ id: id }));
	});
});

module.exports = router;