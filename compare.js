'use strict'

let linebylineReader = require("line-by-line")
let fs = require("fs")

let compare = function(src, target, callback){
	if(!fs.existsSync(src) || !fs.existsSync(target)){
		throw {
			name: "FileNotExist",
			msg: "src file or target file is not exist."
		}
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
	,	unfitTable = new Map()
	
	unfitTable._set = function(srcLine, targetLine){
		if(this.has(srcLine)){
			let map = this.get(srcLine)
			if(map.has(targetLine)){
				map.set(targetLine, map.get(targetLine) + 1)
			}else{
				map.set(targetLine, 1)
			}
		}else{
			let map = new Map()
			map.set(targetLine, 1)
			this.set(srcLine, map)
		}
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