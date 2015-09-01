#!/usr/bin/env node

'use strict'

let ut = require('util')
,	fs = require("fs")
,	clean = require('./clean.js')
,	compare = require("./compare.js")
,	show = require("./show.js")
,	exec = require("./exec/exec.js")
,	md = require("./md.js")

const HELP_COMMAND = "help"
const CLEAN_COMMAND = "clean"
const COMPARE_COMMAND = "compare"
const EXEC_COMMAND = "exec"

let args = process.argv.slice(2)
,	command = args.length === 0 ? '' : args.shift().toLowerCase()

if(command === HELP_COMMAND){
	console.log('\
command list:\n\
	exec - analyze the ua log, return analyzed info. like ua exec [-cof] src [result]\n\
		option c: use cache (default false)\n\
		option o: use optimization for ie and chrome (default false)\n\
		option f: src is a file (default string)\n\
		result should the be a file path and end with .md or .html\n\
	clean - filter the spiders in the ua log. like ua clean src target\n\
	compare - compare two results. like ua compare src target [result]\n\
		result should the be a file path and end with .md or .html\n\
	help - print help')
}else if(command === EXEC_COMMAND){
	const CACHE_FLAG = '-c'

	let [option, srcFilePath, resultFilePath] = args

	if(args.length === 1){
		srcFilePath = option
		option = undefined
		resultFilePath = undefined
	}else if(args.length === 2){
		let regex = /^-([cof])(?:(?=$)|(?!\1))([cof])?(?:(?=$)|(?!(?:\1|\2)))([cof])?$/i
		if(!regex.test(option)){
			resultFilePath = srcFilePath
			srcFilePath = option
			option = undefined
		}
	}

	if(!srcFilePath){
		throw new Error("err: missing src argument.")
	}

	let defaultOption = {
		useCache: false,
		useOptimization: false,
		useFile: false,
	}
	//搞定option对象.
	if(!option || option[0] !== "-"){
		option = defaultOption
	}else{
		let useCache = false
		,	useOptimization = false
		,	useFile = false
		,	regex = /^-([cof])(?:(?=$)|(?!\1))([cof])?(?:(?=$)|(?!(?:\1|\2)))([cof])?$/i
		,	result = regex.exec(option)
		if(result === null){
			option = defaultOption
		}else{
			for(let i = 1 ; i < 4 ; i++){
				let opt = result[i]
				if(opt === "c"){
					useCache = true
				}else if(opt === "o"){
					useOptimization = true
				}else if(opt === "f"){
					useFile = true
				}
			}
			option = {
				useCache: useCache,
				useOptimization: useOptimization,
				useFile: useFile,
			}
		}
	}

	let startTimer = (new Date).getTime()
	,	endTimer = -1
	exec.exec(srcFilePath, option, (result) => {
		endTimer = (new Date).getTime()

		if(!option.useFile){ //只验证一句ua的话, 直接输出分析结果即可.
			console.log(result.getFamily() + ":" + result.getVersion())
			return
		}

		let {
				totalCount = 0,
				hitCount = 0,
				hitRate = 0,
				maxCount = 0,
				minCount = 0,
				averageCount = 0,
				hitTable = {}
			} = result
		,	splited = resultFilePath ? resultFilePath.split(".") : []
		,	suffix = splited.length > 0 ? splited[splited.length - 1] : ''

		if(suffix === "html" || suffix === "md"){			
			let mdDoc = new md()

			mdDoc.appendText("use time : " + (endTimer - startTimer) + "ms")
			mdDoc.appendText("total count : " + totalCount)
			mdDoc.appendText("hit count : " + hitCount)
			mdDoc.appendText("hit rate : " + (hitRate * 100).toFixed(2) + "%")
			mdDoc.appendText("max count : " + maxCount)
			mdDoc.appendText("min count : " + minCount)
			mdDoc.appendText("average count : " + averageCount.toFixed(2))
			let mdTable = mdDoc.createTable()
			mdTable.appendHead("browser name", "browser version", "count")
			for(let name of Object.keys(hitTable)){
				let versionRow = new md
				,	countRow = new md
				,	versionArray = []
				,	countArray = []
				for(let version of Object.keys(hitTable[name])){
					versionArray.push(version)
					countArray.push(hitTable[name][version])
				}
				versionRow.appendMultilineText(versionArray)
				countRow.appendMultilineText(countArray)
				mdTable.appendRow(name, versionRow.getMD(), countRow.getMD())
			}
			mdDoc.appendTable(mdTable.getMD())

			let fd = fs.openSync(resultFilePath, "w+")
			if(suffix === "html"){
				fs.writeSync(fd, mdDoc.toHTML())
			}else if(suffix === "md"){
				fs.writeSync(fd, mdDoc.getMD())
			}
		}

		show.multiline(
			"exec finish",
			"use time : " + (endTimer - startTimer) + "ms",
			"total count : " + totalCount,
			"hit count : " + hitCount,
			"hit rate : " + (hitRate * 100).toFixed(2) + "%",
			"max count : " + maxCount,
			"min count : " + minCount,
			"average count : " + averageCount.toFixed(2)
		)
	})
}else if(command === CLEAN_COMMAND){
	let srcFilePath = args[1]
	let targetFilePath = args[2]
	if(!srcFilePath || !targetFilePath){
		throw new Error('err: missing src or target argument.')
	}

	clean(srcFilePath, targetFilePath, () => {
		console.log("clean finish.")
	})

}else if(command === COMPARE_COMMAND){
	let srcFilePath = args[1]
	let targetFilePath = args[2]
	let resultFilePath = args[3]
	if(!srcFilePath || !targetFilePath){
		throw new Error("err: missing src or target argument.")
	}

	compare(srcFilePath, targetFilePath, (result) => {
		let {
			fitCount = 0,
			unfitCount = 0,
			totalCount = 0,
			fitRate = 0,
			unfitTable = {}
		} = result
		,	splited = resultFilePath ? resultFilePath.split(".") : []
		,	suffix = splited.length > 0 ? splited[splited.length - 1] : ''

		if(suffix === "html" || suffix === "md"){
			let mdDoc = new md

			mdDoc.appendText("total count : " + totalCount)
			mdDoc.appendText("fit count : " + fitCount)
			mdDoc.appendText("unfit count : " + unfitCount)
			mdDoc.appendText("fit rate : " + (fitRate * 100).toFixed(2) + "%")

			let mdTable = mdDoc.createTable()
			mdTable.appendHead("src name", "target name", "count")
			for(let srcName of Object.keys(unfitTable)){
				let targetRow = new md
				,	countRow = new md
				,	targetArray = []
				,	countArray = []
				for(let targetName of Object.keys(unfitTable[srcName])){
					targetArray.push(targetName)
					countArray.push(unfitTable[srcName][targetName])
				}
				targetRow.appendMultilineText(targetArray)
				countRow.appendMultilineText(countArray)
				mdTable.appendRow(srcName, targetRow.getMD(), countRow.getMD())
			}
			mdDoc.appendTable(mdTable.getMD())

			let fd = fs.openSync(resultFilePath, "w+")
			if(suffix === "html"){
				fs.writeSync(fd, mdDoc.toHTML())
			}else if(suffix === "md"){
				fs.writeSync(fd, mdDoc.getMD())
			}
		}

		//直接输出在屏幕. （屏幕输出暂时不输出unfitTable信息.）
		show.multiline(
			"fit count : " + fitCount,
			"unfit count : " + unfitCount,
			"total count : " + totalCount,
			"fit rate : " + fitRate
		)
	})

}else{
	console.error('err: unknown command, please enter "ua help" for more options.')
}