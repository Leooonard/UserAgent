//public method

"use strict"

let fs = require("fs")

function isDirectory(path){
    return  fs.lstatSync(path).isDirectory()
}

exports.isDirectory = isDirectory