'use strict'

let UA = require("./ua.js")
/*
	cache:
	{
		family: string,
		regex: RegExp object,
	}
*/
,	cacheArray = []
,	cacheMaxLength = 3 //设置为0时有个小bug.
,	hitCount = 0
,	missCount = 0
,	cacheCount = 0
,	LRU = require("lru-cache")(1000)

// let match = function(ua){
// 	let counter = 0
// 	for(let cache of cacheArray){
// 		counter++
// 		cacheCount++
// 		let result = cache.regex.exec(ua)
// 		if(!!result){
// 			hitCount++
// 			redefine(cache)
// 			return {
// 				UA: new UA(cache.family, result[1], result[2], result[3]),
// 				counter: counter,
// 			}
// 		}
// 	}
// 	missCount++
// 	return {
// 		UA: undefined,
// 		counter: counter,
// 	}
// }

let match = function(ua){
	if(LRU.has(ua)){
		// redefine(ua, LRU.get(ua))
		return {
			UA: LRU.get(ua),
			counter: 0,
		}
	}else{
		return {
			UA: undefined,
			counter: 0,
		}
	}
}

let redefine = function(ua, uaObject){
	nodeLRU(ua, uaObject)
}

let nodeLRU = function(ua, uaObject){
	if(LRU.has(ua)){
		return
	}else{
		LRU.set(ua, uaObject)
	}
}

let load = function(ua, uaObject){
	redefine(ua, uaObject)
}

let result = function(){
	console.log("hit count : " + hitCount)
	console.log("miss count : " + missCount)
	console.log("cache count : " + cacheCount)
	console.log("-------------------------")
}

module.exports = {
	match: match,
	load: load,
	result: result,
}

//LRU算法, 最近使用在最前. 替换时, 将最久没有使用的正则替换出去.
// let LRU = function(newCache){
// 	for(let i = 0 ; i < cacheArray.length ; i++){
// 		let cache = cacheArray[i]
// 		if(cache.regex.source === newCache.regex.source){
// 			LRU.timeArray[i]++
// 			return
// 		}
// 	}
// 	if(cacheArray.length < cacheMaxLength){
// 		cacheArray.push(newCache)
// 		LRU.timeArray.push(1)
// 	}else{
// 		let pos = -1
// 		,	minTime = Infinity
// 		for(let i = 0 ; i < LRU.timeArray.length ; i++){
// 			let time = LRU.timeArray[i]
// 			if(time < minTime){
// 				minTime = time
// 				pos = i
// 			}
// 		}
// 		cacheArray.splice(pos, 1)
// 		LRU.timeArray.splice(pos, 1)
// 		cacheArray.push(newCache)
// 		LRU.timeArray.push(1)
// 	}
// }
// LRU.timeArray = []

let LFU = function(newCache){
	for(let i = 0 ; i < cacheArray.length ; i++){
		let cache = cacheArray[i]
		if(cache.regex.source === newCache.regex.source){
			cacheArray.splice(i, 1) //把元素提升到第一位.
			cacheArray.unshift(cache)
			return
		}
	}
	if(cacheArray.length < cacheMaxLength){
		cacheArray.unshift(newCache)
	}else{
		cacheArray.pop()
		cacheArray.unshift(newCache)
	}
}

let FIFO = function(newCache){
	for(let i = 0 ; i < cacheArray.length ; i++){
		let cache = cacheArray[i]
		if(cache.regex.source === newCache.regex.source){
			return
		}
	}
	if(cacheArray.length < cacheMaxLength){
		cacheArray.push(newCache)
	}else{
		cacheArray.pop()
		cacheArray.push(newCache)
	}
}