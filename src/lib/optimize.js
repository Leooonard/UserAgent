//directly decide useragent

"use strict"

function IE(ua){
    const IE_SEGEMENTS = ["compatible", "MSIE", "Windows",
     ".NET", "Win64", "x64", "IA64", "WOW64", "Trident"]

    if(typeof ua !== "string"){
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

    let segements = ua.split(";")

    for(let segement of segements){
        segement = segement.trim().toLowerCase()
        let flag = false
        for(let ieSegement of IE_SEGEMENTS){
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

function Chrome(ua){
    const CHROME_SEGEMENTS = ["AppleWebkit", "Chrome/", "Safari/"]
    ,   CHROME_FEATURE = "(KHTML, like Gecko)"

    if(typeof ua !== "string"){
        return false
    }

    if(ua.indexOf(CHROME_FEATURE) !== -1){
        ua = ua.replace(CHROME_FEATURE, "")
    }else{
        return false
    }

    let closeParentPos = -1
    if((closeParentPos = ua.lastIndexOf(")")) === -1){
        return false
    }

    ua = ua.slice(closeParentPos + 1) //闭括号后的提出来.
    let segements = ua.split(" ")

    for(let segement of segements){
        if(segement === ""){
            continue
        }
        segement = segement.trim().toLowerCase()
        let flag = false
        for(let chromeSegement of CHROME_SEGEMENTS){
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

let supportMap = {
    IE,
    Chrome,
}

function optimize(ua, family){
    if(typeof supportMap[family] !== "function"){
        return false
    }

    return supportMap[family](ua)
}

module.exports = optimize