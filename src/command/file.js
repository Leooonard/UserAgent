//parse useragent file.

"use strict"

const RESULT_LOG = "result.log"


var fs = require("fs")
,   path = require("path")
,   linebylineReader = require("line-by-line")
,   parse = require("../lib/parser.js")
,   printer = require("../lib/print.js")
,   isDirectory = require("../lib/tool.js").isDirectory

function parseConfigFile(configPath, callback){
    configPath = configPath.indexOf("./") === 0 ? configPath : "./" + configPath

    let lineReader = new linebylineReader(configPath)
    ,   json = ""
    lineReader.on("err", err => {
        callback(err)
    })
    lineReader.on("line", line => {
        json += line
    })
    lineReader.on("end", () => {
        let config
        try{
            config = JSON.parse(json)
        }catch(err){
            callback(err)
        }

        let {file = undefined, output = undefined, analysis = false, count = 0} = config
        if(typeof file !== "string"){
            callback(new Error("file attribute must be string."))
        }
        if(typeof output !== "string"){
            output = undefined
        }

        callback(undefined, {
            file,
            output,
            analysis,
            count,
        })
    })
}

function _process(config){

    let lineReader = new linebylineReader(config.file)
    ,   resultList = []

    lineReader.on("err", err => {
        throw new Error(err)
    })
    lineReader.on("line", line => {
        let result = parse(line, true)
        result.useragent = line
        resultList.push(result)
    })
    lineReader.on("end", () => {
        let fd
        if(config.output === undefined){
            fd = undefined
        }else{
            fd = fs.openSync(path.join(config.output, RESULT_LOG), "w+")
        }
        resultList.forEach(function(result){
            printer.printPrettyObject(result, fd)  
        })
        if(!!config.analysis){

        }

        console.log("========== all finish ==========")
    })
}

function processFile([configPath]){
    if(typeof configPath !== "string"){
        configPath = "./uap.config.json"
    }

    parseConfigFile(configPath, (err, config) => {
        if(!!err){
            throw new Error(err)
        }
        _process(config)
    })
}   

module.exports = processFile