'use strict'

let linebylineReader = require("line-by-line")
let fs = require("fs")

let compare = function(src, target, callback){
	if(!fs.existsSync(src) || !fs.existsSync(target)){
		throw new Error("src file or target file is not exist.")
	}

	let srcReader = new linebylineReader(src)
	,	targetReader = new linebylineReader(target)
	,	srcLines = []
	,	targetLines = []
	,	fitCount = 0
	,	unfitCount = 0
	, 	totalCount = 0
	, 	srcEnd = false
	,	targetEnd = false
	,	unfitTable = Object.create({
		_set: function(srcLine, targetLine){
			if(this[srcLine] !== undefined){
				let obj = this[srcLine]
				if(obj[targetLine] !== undefined){
					obj[targetLine]++
				}else{
					obj[targetLine] = 1
				}
			}else{
				let obj = {}
				obj[targetLine] = 1
				this[srcLine] = obj
			}
		}
	})
	,	_compare = function(src, tar){
		if(adapter[src] === tar){
			return true
		}
		if(src === "2345 Browser" || src === "Firefox" || src === "Xiaomi")
			return  true
		console.log(src + "    " + tar)
		return false
	}
	,	adapter = {
		"Android": "Android",
		"UCBrowser Android": "UC Browser",
		"QQ Browser Android": "QQ Browser Mobile",
		"Xiaomi": "Chrome Mobile",
		"Chrome Android": "Chrome Mobile",
		"LieBao Browser Android": "Android",
		"Mobile Safari": "Mobile Safari",
		"UCBrowser IOS": "UC Browser",
		"QQ Browser IOS": "QQ BRwoser Mobile",
		"Chrome IOS": "Chrome Mobile iOS",
		"Chrome": "Chrome",
		"Sogou Explorer": "Sogou Explorer",
		"2345 Browser": "2345 Browser",
		"LieBao Browser": "Chrome",
		"Baidu Explorer": "Chrome",
		"QQ Browser": "QQ Browser",
		"Maxthon": "Maxthon",
		"IE": "IE",
		"360 Browser": "IE",
		"Firefox": "Firefox",
		"IE Mobile": "IE Mobile",
		"Opera": "Opera",
		"Opera Mini": "Opera Mini",
		"Safari": "Safari",
		"other": "Other",
	}

	srcReader.on("err", (err) => {
		throw {
			name: "ReadError",
			msg: err,
		}
	})

	srcReader.on("line", (line) => {
		srcLines.push(line)
		while(srcLines.length > 0 && targetLines.length > 0){
			let srcLine = srcLines.shift()
			let targetLine = targetLines.shift()
			if(_compare(srcLine, targetLine)){
				fitCount++
			}else{
				unfitCount++
				unfitTable._set(srcLine, targetLine)
			}
			totalCount++
		}
	})

	srcReader.on("end", () => {
		srcEnd = true
		if(srcEnd && targetEnd){
			typeof callback === "function" && callback({
				fitCount: fitCount,
				unfitCount: unfitCount,
				totalCount: totalCount,
				fitRate: fitCount / totalCount,
				unfitTable: unfitTable,
			})
		}
	})

	targetReader.on("err", (err) => {
		throw {
			name: "ReadError",
			msg: err,
		}
	})

	targetReader.on("line", (line) => {
		targetLines.push(line)
		while(srcLines.length > 0 && targetLines.length > 0){
			let srcLine = srcLines.shift()
			let targetLine = targetLines.shift()
			if(_compare(srcLine, targetLine)){
				fitCount++
			}else{
				unfitCount++
				unfitTable._set(srcLine, targetLine)
			}
			totalCount++
		}
	})

	targetReader.on("end", () => {
		targetEnd = true
		if(srcEnd && targetEnd){
			typeof callback === "function" && callback({
				fitCount: fitCount,
				unfitCount: unfitCount,
				totalCount: totalCount,
				fitRate: fitCount / totalCount,
				unfitTable: unfitTable,
			})
		}
	})
}

module.exports = compare