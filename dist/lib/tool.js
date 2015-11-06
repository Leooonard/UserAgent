//public method

"use strict";

var fs = require("fs");

function isDirectory(path) {
    return fs.lstatSync(path).isDirectory();
}

exports.isDirectory = isDirectory;