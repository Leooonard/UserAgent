//handle terminal args

'use strict'

function processArgs(args){
    args = args.slice(2)

    let [command, params] = (args.length > 0 ? [args[0], args.slice(1)] : ["", []])

    return {
        command,
        params,
    }
}

module.exports = processArgs