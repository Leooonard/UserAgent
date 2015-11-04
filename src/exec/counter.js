'use strict'

let registed = {}

let register = function(name){
	if(registed[name] !== undefined){
		registed[name] = 0
	}
}

let record = function(name){
	if(registed[name] !== undefined){
		registed[name] += 1
	}
}

let result = function(name){
	return registed[name]
}

let destory = function(name){
	if(registed[name] !== undefined){
		registed[name] = undefined
	}
}

exports.register = register
exports.record = record
exports.result = result
exports.destory = destory