'use strict'

let ut = require('util')
,	fs = require("fs")
,	clean = require('./clean/clean.js')
,	compare = require("./compare.js")
,	show = require("./show.js")
,	execFromFile = require("./exec/exec.js").execFromFile
,	exec = require("./exec/exec.js").exec
,	md = require("./md.js")

const HELP_COMMAND = "help"
const CLEAN_COMMAND = "clean"
const COMPARE_COMMAND = "compare"
const EXEC_COMMAND = "exec"

let args = process.argv.slice(2)
let command = args.length === 0 ? '' : args[0].toLowerCase()


if(command === HELP_COMMAND){
	console.log('\
use this like "node index.js command file"\n\
command:\n\
	exec - analyze the ua log, return analyzed info. like node index.js exec [-c] src [result]\n\
	clean - filter the spiders in the ua log. like node index.js clean src target\n\
	compare - compare two results. like node index.js compare src target [result]\n\
	help - print help.')
}else if(command === EXEC_COMMAND){
	const CACHE_FLAG = '-c'

	let useCache = args[1]
	,	srcFilePath = args[2]
	,	resultFilePath = args[3]

	if(args.length === 2){
		srcFilePath = useCache
		useCache = undefined
	}else if(args.length === 3){
		if(useCache !== CACHE_FLAG){
			resultFilePath = srcFilePath
			srcFilePath = useCache
			useCache = undefined
		}
	}

	if(!srcFilePath){
		console.error("err: missing file path, use this command like node index.js exec [-c] src [result]")
		return
	}

	execFromFile(srcFilePath, (result) => {
		let mdDoc = new md()
		,	totalCount = result.totalCount || 0
		,	hitCount = result.hitCount || 0
		,	hitRate = result.hitRate || 0
		,	maxCount = result.maxCount || 0
		,	minCount = result.minCount || 0
		,	averageCount = result.averageCount || 0
		,	hitTable = result.hitTable || {}
		,	splited = resultFilePath ? resultFilePath.split(".") : []
		,	suffix = splited.length > 0 ? splited[splited.length - 1] : ''

		if(suffix === "html" || suffix === "md"){
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
			"total count : " + totalCount,
			"hit count : " + hitCount,
			"hit rate : " + hitRate,
			"max count : " + maxCount,
			"min count : " + minCount,
			"average count : " + averageCount
		)
	}, useCache === CACHE_FLAG) //是否使用缓存

}else if(command === CLEAN_COMMAND){
	let srcFilePath = args[1]
	let targetFilePath = args[2]
	if(!srcFilePath || !targetFilePath){
		console.error('err: missing file path, use this command like node index.js clean src target.')
		return
	}

	clean(srcFilePath, targetFilePath, () => {
		console.log("clean finish.")
	})

}else if(command === COMPARE_COMMAND){
	let srcFilePath = args[1]
	let targetFilePath = args[2]
	let resultFilePath = args[3]
	if(!srcFilePath || !targetFilePath){
		console.error("err: missing file path, use this command like node index.js compare src target.")
		return
	}

	compare(srcFilePath, targetFilePath, (result) => {
		let fitCount = result.fitCount || 0
		,	unfitCount = result.unfitCount || 0
		,	totalCount = result.totalCount || 0
		,	fitRate = result.fitRate || 0
		,	unfitTable = result.unfitTable || {}

		,	splited = resultFilePath ? resultFilePath.split(".") : []
		,	suffix = splited.length > 0 ? splited[splited.length - 1] : ''

		if(suffix === "html" || suffix === "md"){
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
	console.error('err: unknown command, please enter "node index.js help" for more options.')
}