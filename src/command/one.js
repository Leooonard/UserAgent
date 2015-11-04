//parse useragents.

var parse = require("../lib/parser.js")

function processOne(uas){
    for(let ua of uas){        
        let result = parse(ua)
        console.log(result)
    }
}

module.exports = processOne