'use strict'

let linebylineReader = require("line-by-line")
,	fs =require("fs")
,	uaList = require("./ua.json")
,	uaMap = new Map
,	l1Map = new Map
,	l2Map = new Map

//将json转换为map.
Object.keys(uaList.L1).forEach((val, idx, array) => {
	l1Map.set(new RegExp(val), uaList.L1[val])
})
Object.keys(uaList.L2).forEach((val, idx, array) => {
	let map = new Map
	Object.keys(uaList.L2[val]).forEach((v, i, arr) => {
		map.set(new RegExp(val), uaList.L2[val][v])
	})
	l2Map.set(val, map)
})
uaMap.set("L1", l1Map)
uaMap.set("L2", l2Map)

let ua = function(family, main, minor, patch){
	this.family = family
	this.main = main
	this.minor = minor
	this.patch = patch
}

let uaCount = 0
,	totalCount = 0
,	hitCount = 0
,	maxCount = 0
,	minCount = Infinity

let test = function(ua){
	let tempCount = 0
	for(let regex of uaMap.get("L1").keys()){
		totalCount++
		tempCount++
		let result = regex.exec(ua)
		if(!!result){
			let l2key = uaMap.get("L1").get(regex)
			if(uaMap.get("L2").has(l2Key)){
				let l2Map = uaMap.get("L2").get(l2Key)
				for(let regex of l2Map.keys()){
					totalCount++
					tempCount++
					let result = regex.exec(ua)
					if(!!result){
						hitCount++
						if(tempCount > maxCount){
							maxCount = tempCount
						}
						if(tempCount < minCount){
							minCount = tempCount
						}
						return new ua(l2Map.get(regex), result[2], result[3], result[4])
					}
				}
			}else{
				hitCount++
				if(tempCount > maxCount){
					maxCount = tempCount
				}
				if(tempCount < minCount){
					minCount = tempCount
				}
				return new ua(l2Key, result[2], result[3], result[4])
			}
		}
	}
	if(tempCount > maxCount){
		maxCount = tempCount
	}
	if(tempCount < minCount){
		minCount = tempCount
	}
	return false
}

let exec = function(src, callback){
	if(!fs.existsSync(src)){
		throw {
			name: "FileNotExist",
			msg: "src file is not exist."
		}
	}

	let lineReader = new linebylineReader(src)
	,	hitTable = new Map

	lineReader.on("err", (err) => {
		throw {
			name: "ReadError",
			msg: err
		}
	})

	lineReader.on("line", (line) => {
		uaCount++
		let result = test(line)
		
	})

	lineReader.on("end", () => {
		let result = {
			totalCount: uaCount,
			hitCount: hitCount,
			hitRate: hitCount / uaCount,
			maxCount: maxCount,
			minCount: minCount,
			averageCount: totalCount / uaCount,
			hitTable: hitTable,
		}
		typeof callback === "function" && callback(result)
	})
}

module.exports = exec