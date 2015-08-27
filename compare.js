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

	srcReader.on("err", (err) => {
		throw {
			name: "ReadError",
			msg: err,
		}
	})

	srcReader.on("line", (line) => {
		srcLines.push(line)
		while(srcLines.length > 0 && targetLines.length > 0){
			let srcLine = srcLines.shift().toLowerCase()
			let targetLine = targetLines.shift().toLowerCase()
			if(srcLine === targetLine){
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
			let srcLine = srcLines.shift().toLowerCase()
			let targetLine = targetLines.shift().toLowerCase()
			if(srcLine === targetLine){
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