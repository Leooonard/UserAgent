//parse useragents.

let parse = require("../lib/parser.js")
,   printer = require("../lib/print.js")

function processOne(uas){
    for(let ua of uas){        
        let result = parse(ua)
        result["useragent"] = ua
        printer.printPrettyObject(result)
    }
}

module.exports = processOne