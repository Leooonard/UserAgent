'use strict'

let linebylineReader = require("line-by-line")
,	show = require("../show.js")
,	fs = require("fs")
,	path = require("path")
,	uaList = require("./ua.json")
,	cache = require("./cache.js")
,	UA = require("./ua.js")
,	ieOptimize = require("./optimize-ie.js")
,	logFd
,	resultFd
,	cacheFlag

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
let test = function(ua){
	let counter = 0
	,	mixCounter = (obj) => {
		obj.counter = counter
		return obj
	}
	,	success = (ua, regex) => {
		if(!!cacheFlag && !!regex){
			cache.load(ua.getFamily(), regex)
		}
		fs.writeSync(logFd, "-------------------------\n")
		fs.writeSync(resultFd, ua.getFamily() + "\n")
		return mixCounter({
			result: ua
		})
	}
	,	fail = () => {
		fs.writeSync(logFd, "-------------------------\n")
		fs.writeSync(resultFd, "Other\n")
		return mixCounter({
			result: false
		})
	}

	if(!!cacheFlag){
		let cacheResult = cache.match(ua)
		counter += cacheResult.counter
		if(!!cacheResult.UA){
			return success(cacheResult.UA)
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
				if(ieOptimize.optimize(ua, lv1Name)){
					return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]))
				}

				let lv2Obj = uaList.L2[lv1Name]
				for(let lv2Name of Object.keys(lv2Obj)){
					counter++
					let lv2Regex = lv2Obj[lv2Name]
					fs.writeSync(logFd, "LV2 : " + lv2Regex.source + "\n");
					let lv2Result = lv2Regex.exec(ua)
					if(!!lv2Result){
						return success(new UA(lv2Name, lv2Result[1], lv2Result[2], lv2Result[3]), lv2Regex)
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

let exec = function(ua, useCache){
	let uaList = []
	,	hitTable = new HitTable
	, 	counter = new Counter

	logFd = fs.openSync(path.join(__dirname, "exec-log.log"), "w")
	resultFd = fs.openSync(path.join(__dirname, "exec-result.log"), "w")

	if(useCache === false){
		cacheFlag = false
	}else{
		cacheFlag = true
	}

	if(ua instanceof Array){
		uaList = ua.slice()
	}else{
		uaList.push(ua.toString())
	}

	for(let ua of uaList){
		let result = test(ua)
		counter.add(result.result, result.counter)
		hitTable.add(result.result)
	}

	let result = counter.get()
	result.hitTable = hitTable.get()
	return result
}

let execFromFile = function(src, callback, useCache){
	if(!fs.existsSync(src)){
		throw new Error("src file is not exist.")
	}

	let lineReader = new linebylineReader(src)
	,	hitTable = new HitTable
	,	counter = new Counter

	logFd = fs.openSync(path.join(__dirname, "exec-log.log"), "w")
	resultFd = fs.openSync(path.join(__dirname, "exec-result.log"), "w")

	if(useCache === false){
		cacheFlag = false
	}else{
		cacheFlag = true
	}

	lineReader.on("err", (err) => {
		throw new Error(err)
	})

	lineReader.on("line", (line) => {
		let result = test(line)
		counter.add(result.result, result.counter)
		hitTable.add(result.result)
	})

	lineReader.on("end", () => {
		let result = counter.get()
		result.hitTable = hitTable.get()

		typeof callback === "function" && callback(result)
	})
}

module.exports = {
	execFromFile: execFromFile,
	exec: exec,
}