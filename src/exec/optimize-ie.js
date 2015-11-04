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
	
	let openParentPos = -1
	
	if((openParentPos = ua.indexOf("(")) === -1 || ua.charAt(ua.length - 1) !== ")"){
		return false
	}

	ua = ua.slice(openParentPos + 1, -1)
	if(ua.indexOf("(") !== -1 || ua.indexOf(")") !== -1){
		return false
	}

	ua = ua.slice(openParentPos + 1, -1) //括号中间的提出来.
	let segements = ua.split(";")

	for(let segement of segements){
		let flag = false
		for(let ieSegement of IE_SEGEMENTS){
			segement = segement.trim()
			segement = segement.toLowerCase()
			if(segement.indexOf(ieSegement.toLowerCase()) === 0){
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