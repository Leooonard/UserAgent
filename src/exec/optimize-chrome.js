'use strict'

const TARGET_NAME = "chrome"
,	CHROME_SEGEMENTS = ["AppleWebkit", "Chrome/", "Safari/"]
,	CHROME_FEATURE = "(KHTML, like Gecko)"

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

	if(ua.indexOf(CHROME_FEATURE) != -1){
		ua = ua.replace(CHROME_FEATURE, "")
	}else{
		return false
	}

	let closeParentPos = -1

	for(var i = 0 ; i < ua.length ; i++){
		if(ua.charAt(i) === ")"){
			closeParentPos = i
		}
	}

	if(closeParentPos === -1){
		return false
	}

	ua = ua.slice(closeParentPos + 1) //闭括号后的提出来.
	let segements = ua.split(" ")

	for(let segement of segements){
		if(segement === "") continue
		let flag = false
		for(let chromeSegement of CHROME_SEGEMENTS){
			segement = segement.trim()
			segement = segement.toLowerCase()
			if(segement.indexOf(chromeSegement.toLowerCase()) === 0){
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