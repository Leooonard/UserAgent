//parse useragent file.

"use strict"

var fs = require("fs")
,   linebylineReader = require("line-by-line")
,   parse = require("../lib/parser.js")
,   printer = require("../lib/print.js")

function processFile([srcPath, destPath]){
    if(typeof srcPath !== "string" || typeof destPath !== "string"){
        throw new Error("file command need two params, src file path and dest file path")
    }
    if(!fs.existsSync(srcPath)){
        throw new Error("src file is not exist.")
    }

    let lineReader = new linebylineReader(srcPath)
    lineReader.on("err", err => {
        throw new Error(err)
    })
    lineReader.on("line", line => {
        let result = parse(line, true)
        result.useragent = line
        printer.printPrettyObject(result)
    })
    lineReader.on("end", () => {
        console.log("========== all finish ==========")
    })
}   

module.exports = processFile