var path = require('path');

var assetsDir = path.join(__dirname, 'assets');

module.exports = Object.freeze({
    HOST: 'ec2-18-217-14-21.us-east-2.compute.amazonaws.com',
    ASSETS: assetsDir
});