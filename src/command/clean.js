//clean useragent log. remove spiders.

"use strict"

let fs = require("fs")

function processClean([srcPath, destPath]){
    if(typeof srcPath !== "string"){
        throw new Error("file command need two params, src file path and dest file path")
    }
    if(!fs.existsSync(srcPath)){
        throw new Error("src file is not exist.")
    }    
}

module.exports = processClean