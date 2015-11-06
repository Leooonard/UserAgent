//parse one useragent. return version info and statistic info

let regexps = require("../static/standard-regexp.json")
,   cache = require("../lib/cache.js")
,   optimize = require("../lib/optimize.js")
,   userAgent = undefined
,   useCache = false

let tester = {
    regexp(ua, reg){
        let result = new RegExp(reg).exec(ua)
        if(result === null){
            return  false
        }
        tester.result = {
            major: result[1] || "unknown",
            minor: result[2] || "unknown",
            patch: result[3] || "unknown",
        }
        return true
    },
    string(ua, str){
        return ua.indexOf(str) !== -1 
    },
}

function processResult(result){
    !!useCache && cache.set(userAgent, result)
    return result
}

function error(){
    const ERROR_RESULT = {
        family: "unknown",
        major: "unknown",
        minor: "unknown",
        patch: "unknown",
    }
    return processResult(ERROR_RESULT)
}

function parse(ua, uc = false){
    useCache = uc
    userAgent = ua

    if(!!useCache && cache.has(userAgent)){
        return cache.get(userAgent)
    }

    let mainBrand = undefined

    for(let regexp of regexps){
        let {test, testType, retest, retestType} = regexp
        if(!!tester[testType] && tester[testType](userAgent, test)){
            if(!!retest){
                if(!!tester[retestType] && tester[retestType](userAgent, retest)){
                    mainBrand = regexp
                    break
                }else{
                    continue
                }
            }else{
                mainBrand = regexp
                break
            }
        }
    }

    if(mainBrand === undefined){
        return error()
    }

    if(!mainBrand.children || optimize(userAgent, mainBrand.family)){
        return processResult({
            family: mainBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch,
        })
    }

    let childBrand = undefined

    for(let child of mainBrand.children){
        let {test, testType, retest, retestType} = child
        if(!!tester[testType] && tester[testType](userAgent, test) 
            && !!retest && !!tester[retestType] && tester[retestType](userAgent, retest)){
            childBrand = child
            break
        }
    }

    if(childBrand === undefined){
        return processResult({
            family: mainBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch,
        })
    }else{
        return processResult({
            family: childBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch,
        })
    }
}

module.exports = parse