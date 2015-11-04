// 将json对象转换为真正的js对象.

/*
	原来的json对象.
	[
		{
			name: 浏览器名,
			test: 测试ua的字符串, 字符串数组或正则,
			type: string | array | regexp,
			flag: string, //当type为regexp时, 表明正则使用的标记. 当type为string或array时, 表明指定在ua中的位置.
			hardtest: string | null //测试ua的正则, 仅当test为字符串或字符串数组时使用, 用于判断出ua的版本号,
			hardflag: string, //hardtest正则使用的标记,
			optimizer: 优化器的名字 | "null",
			children: [ //子测试对象 | "null"
				{}, //同样的对象结构.
				...
			]
		}
		...
	]

	生成后的js对象.
	[
		{
			name:  浏览器名,
			test: function(){},
			hardtest: function(){},
			optimizer: function(){},
			children: [
				{},
				...
			]
		}
	]
*/

'use strict'

let optimizer = require("./optimizer.js")

//检查一组字符串是否在目标字符串中按顺序出现.
let containsSequence = function(str, segements, start){
	let minPos = -1
	,	startFlag = (typeof start === "number")
	for(let segement of segements){
		let tempPos = str.indexOf(segement)
		if(tempPos === -1 || tempPos < minPos){
			return false
		}
		if(startFlag){
			startFlag = false
			if(tempPos !== start){
				return false
			}
		}
		minPos = tempPos
	}
	return true
}

let generate = function(jsonObjs){
	let objArray = []

	for(let jsonObj of jsonObjs){
		let obj = {
			name: jsonObj.name || ""
		} 

		let flag = jsonObj.flag
		,	test = jsonObj.test
		,	type = jsonObj.type
		,	hardtest = jsonObj.hardtest
		,	hardflag = jsonObj.hardflag
		,	optimizer = jsonObj.optimizer
		,	children = jsonObj.children

		if(type === "string"){
			if(flag === "null"){
				obj.test = function(ua){
					return ua.indexOf(test) !== -1
				}
			}else{
				flag = parseInt(flag)
				obj.test = function(ua){
					return ua.indexOf(test) === flag 
				}
			}
		}else if(type === "array"){
			if(flag === "null"){
				obj.test = function(ua){
					return containsSequence(ua, test)
				}
			}else{
				flag = parseInt(flag)
				obj.test = function(ua){
					return containsSequence(ua, test, flag)
				}
			}
		}else{
			let regex
			if(flag === "null"){
				regex = new RegExp(test)
			}else{
				regex = new RegExp(test, flag)
			}
			obj.test = function(ua){
				return regex.exec(ua)
			}
		}

		if(type !== "regexp" && hardtest !== "null"){
			let regex
			if(hardflag === "null"){
				regex = new RegExp(hardtest)
			}else{
				regex = new RegExp(hardtest, hardflag)
			}
			obj.hardtest = function(ua){
				return regex.exec(ua)
			}
		}

		if(jsonObj.optimizer !== "null"){
			obj.optimizer = optimizer[jsonObj.optimizer]
		}

		if(children !== "null"){
			obj.children = generate(children)
		}

		objArray.push(obj)
	}

	return objArray
}
