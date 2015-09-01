'use strict'

let linebylineReader = require("line-by-line")
,	fs = require("fs")
,	path = require("path")
,	show = require("../show.js")
,	uaList = require("../../static/ua.json")
,	cache = require("./cache.js")
,	UA = require("./ua.js")
,	ieOptimize = require("./optimize-ie.js")
,	chromeOptimize = require("./optimize-chrome.js")
,	logFd
,	resultFd

//将json转换为map.
Object.keys(uaList.L1).forEach((val, idx, array) => {
	uaList.L1[val] = new RegExp(uaList.L1[val], "i")
})
Object.keys(uaList.L2).forEach((val, idx, array) => {
	Object.keys(uaList.L2[val]).forEach((v, i, arr) => {
		uaList.L2[val][v] = new RegExp(uaList.L2[val][v], "i")
	})
})

let HitTable = function(){
	let hitMap = {}

	this.add = (ua) => {
		if(ua instanceof UA){
			let family = ua.getFamily()
			,	version = ua.getVersion()
			if(hitMap[family] !== undefined){
				let map = hitMap[family]
				if(map[version] !== undefined){
					map[version] = map[version] + 1
				}else{
					map[version] = 1
				}
			}else{
				let map = {}
				map[version] = 1
				hitMap[family] = map
			}
		}
	}

	this.get = () => hitMap
}

let Counter = function(){
	let uaCount = 0
	,	totalCount = 0
	,	hitCount = 0
	,	maxCount = 0
	,	minCount = Infinity
	,	counterTable = {}

	this.add = (success, counter) => {
		if(!!success){
			hitCount++
		}
		uaCount++
		totalCount += counter

		if(counter > maxCount){
			maxCount = counter
		}
		if(counter < minCount){
			minCount = counter
		}

		if(!!success){
			if(counterTable[counter] !== undefined){
				counterTable[counter] = counterTable[counter] + 1
			}else{
				counterTable[counter] = 1
			}
		}
	}

	this.get = () => {
		return {
			uaCount: uaCount,
			totalCount: totalCount,
			hitCount: hitCount,
			maxCount: maxCount,
			minCount: minCount,
			hitRate: hitCount / uaCount,
			averageCount: totalCount / uaCount,
		}
	}
}

/*
	input: ua string
	output: {
		result: ua object,
		counter: number,
	}
*/
let testCounter = 0
let test = function(ua, useCache, useOptimization){
	let counter = 0
	,	mixCounter = (obj) => {
		obj.counter = counter
		return obj
	}
	,	success = (uaObject) => {
		if(!!useCache){
			cache.load(ua, uaObject)
		}
		fs.writeSync(logFd, "-------------------------\n")
		fs.writeSync(resultFd, uaObject.getFamily() + "\n")
		return mixCounter({
			result: uaObject
		})
	}
	,	fail = () => {
		fs.writeSync(logFd, "-------------------------\n")
		fs.writeSync(resultFd, "Other\n")
		return mixCounter({
			result: false
		})
	}

	if(!!useCache){
		let cacheResult = cache.match(ua)
		counter += cacheResult.counter
		if(!!cacheResult.UA){
			return success(cacheResult.UA)
		}else{
			console.log(testCounter++)
		}
	}

	for(let lv1Name of Object.keys(uaList.L1)){
		counter++
		let lv1Regex = uaList.L1[lv1Name]
		fs.writeSync(logFd, "LV1 : " + lv1Regex.source + "\n")
		let lv1Result = lv1Regex.exec(ua)
		if(!!lv1Result){
			if(uaList.L2[lv1Name] !== undefined){
				//先做优化判断.
				if(!!useOptimization){
					if(ieOptimize.optimize(ua, lv1Name)){
						return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]))
					}
					if(chromeOptimize.optimize(ua, lv1Name)){
						return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]))
					}
				}

				let lv2Obj = uaList.L2[lv1Name]
				for(let lv2Name of Object.keys(lv2Obj)){
					counter++
					let lv2Regex = lv2Obj[lv2Name]
					fs.writeSync(logFd, "LV2 : " + lv2Regex.source + "\n");
					let lv2Result = lv2Regex.exec(ua)
					if(!!lv2Result){
						return success(new UA(lv2Name, lv2Result[1], lv2Result[2], lv2Result[3]))
					}
				}
				return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]))
			}else{
				return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]))
			}
		}
	}

	return fail()
}

let exec = function(ua, option, callback){
	let uaList = []
	,	hitTable = new HitTable
	, 	counter = new Counter

	logFd = fs.openSync(path.join(__dirname, "../../static/exec-log.log"), "w")
	resultFd = fs.openSync(path.join(__dirname, "../../static/exec-result.log"), "w")

	if(option.useFile){
		execFromFile(ua, option.useCache, option.useOptimization, callback)
	}else{
		execFromString(ua, option.useCache, option.useOptimization, callback)
	}
}

let execFromString = function(src, useCache, useOptimization, callback){
	let result = test(src.toString(), useCache, useOptimization).result
	typeof callback === "function" && callback(result)
}

let execFromArray = function(srcArray, option, callback){
	if(!(srcArray instanceof Array)){
		return []
	}else{
		let uaArray = []
		for(let ua of srcArray){
			let result = test(ua.toString(), !!option.useCache, !!option.useOptimization)
			uaArray.push(result)
		}
		callback(uaArray)
	}
}

let execFromFile = function(src, useCache, useOptimization, callback){
	if(!fs.existsSync(src)){
		throw new Error("src file is not exist.")
	}

	let lineReader = new linebylineReader(src)
	,	hitTable = new HitTable
	,	counter = new Counter

	logFd = fs.openSync(path.join(__dirname, "exec-log.log"), "w")
	resultFd = fs.openSync(path.join(__dirname, "exec-result.log"), "w")

	lineReader.on("err", (err) => {
		throw new Error(err)
	})

	lineReader.on("line", (line) => {
		let result = test(line, useCache, useOptimization)
		counter.add(!!result.result, result.counter)
		hitTable.add(result.result)
	})

	lineReader.on("end", () => {
		let result = counter.get()
		result.hitTable = hitTable.get()

		typeof callback === "function" && callback(result)
	})
}

module.exports = {
	exec: exec,
	analyze: execFromArray,
}