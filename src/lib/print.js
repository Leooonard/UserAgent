//print data.

"use strict"

let fs = require("fs")

function getPrinter(method, fd){
    switch(method){
        case "file": 
            return function(...content){
                fs.writeSync(fd, content.join(" ") + "\n")
            }
        case "console":
            return console.log
        default:
            return console.log
    }
}

function printPrettyObject(obj, fd = undefined){
    let method
    if(!!fd){
        method = "file"
    }else{
        method = "console"
    }
    let print = getPrinter(method, fd)
    print("{")

    for(let key of Object.keys(obj)){
        print("   ", key, ":", obj[key])
    }
    print("}\n")
}

exports.printPrettyObject = printPrettyObject