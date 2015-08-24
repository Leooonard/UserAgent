'use strict'

let multiline = function(){
	let args = Array.prototype.slice.call(arguments)
	for(var arg of args){
		console.log(arg)
	}
}

exports.multiline = multiline