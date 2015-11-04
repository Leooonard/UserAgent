//print data.

"use strict"

function printPrettyObject(obj){
    console.log("{")

    for(let key of Object.keys(obj)){
        console.log("   ", key, ":", obj[key])
    }
    console.log("}\n")
}

exports.printPrettyObject = printPrettyObject