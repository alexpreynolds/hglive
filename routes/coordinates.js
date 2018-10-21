var express = require('express');
var router = express.Router({ strict: true });
var fs = require('fs');
var path = require('path');
var cors = require('cors');
var spawn = require('child_process').spawn;
var constants = require('../constants');

router.use(cors());

router.get('/:id', function(req, res, next) {
    var id = req.params.id;
    
    //
    // Check if file exists
    //
    var srcDir = path.join(constants.ASSETS, id);
    if (!fs.existsSync(srcDir)) {
      return res.status(400).send('Specified id is invalid (' + srcDir + ')');
    }
    var coordsFn = path.join(srcDir, 'coordinates.json');
    if (!fs.existsSync(coordsFn)) {
      return res.status(400).send('Specified id has no associated coordinates (' + coordsFn + ')');
    }
    else {
      res.setHeader('Content-Type', 'application/json');
      res.sendFile(coordsFn);
    }
});

module.exports = router;