'use strict'

const TARGET_NAME = "ie"
const IE_SEGEMENTS = ["compatible", "MSIE", "Windows", ".NET", "Win64", "x64", "IA64", "WOW64", "Trident"]

let isTarget = function(name){
	if(typeof name === "string" && TARGET_NAME === name.toLowerCase()){
		return true
	}else{
		return false
	}
} 

let optimize = function(ua, name){
	if(typeof ua !== "string" || !isTarget(name)){
		return false
	}
	let openParentCount = 0
	,	openParentPos = -1
	,	closeParentCount = 0

	for(var i = 0 ; i < ua.length ; i++){
		if(ua.charAt(i) === "("){
			openParentCount++
			openParentPos = i
		}else if(ua.charAt(i) === ")"){
			closeParentCount++
		}
	}

	if(openParentCount !== 1 || closeParentCount !== 1 || ua[ua.length - 1] !== ")"){
		return false
	}

	ua = ua.slice(openParentPos + 1, -1) //括号中间的提出来.
	let segements = ua.split(";")

	for(let segement of segements){
		let flag = false
		for(let ieSegement of IE_SEGEMENTS){
			segement = segement.trim()
			segement = segement.toLowerCase()
			if(segement.startsWith(ieSegement.toLowerCase())){
				flag = true
				break
			}
		}
		if(!flag){
			return false
		}
	}
	
	return true
}

exports.optimize = optimize