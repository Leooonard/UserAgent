'use strict'

let spiders = require("./spider.json")
,	linebylineReader = require("line-by-line")
,	fs = require("fs")
,	targetFd

let clean = function(src, target, callback){
	if(!fs.existsSync(src)){
		throw new Error("src file is not exist.")
	}

	targetFd = fs.openSync(target, "w+")

	let lineReader = new linebylineReader(src)
	lineReader.on("err", function(err){
		throw {
			name: "ReadError",
			msg: err,
		}
	})

	lineReader.on("line", function(line){
		let ua = line
		if(!test(ua)){
			fs.write(targetFd, ua + "\n")
		}	
	})

	lineReader.on("end", function(){
		fs.close(targetFd)
		typeof callback === "function" && callback()
	})
}

let test = function(ua){
	for(let spider of spiders){
		let regex = new RegExp(spider, "i")
		let result = regex.exec(ua)
		if(!!result){
			return  true
		}
	}
	return false
}

module.exports = clean