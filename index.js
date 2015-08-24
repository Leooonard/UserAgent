'use strict'

let ut = require('util')
let clean = require('./clean/clean.js')
let compare = require("./compare.js")
let show = require("./show.js")
let exec = require("./exec/exec.js")
let md = require("./md.js")

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
	exec - analyze the ua log, return analyzed info. like node index.js exec src [result]\n\
	clean - filter the spiders in the ua log. like node index.js clean src target\n\
	compare - compare two results. like node index.js compare src target [result]\n\
	help - print help.')
}else if(command === EXEC_COMMAND){
	let srcFilePath = args[1]
	let resultFilePath = args[2]
	if(!srcFilePath){
		console.error("err: missing file path, use this command like node index.js exec src [result]")
		return
	}

	exec(srcFilePath, (result) => {
		let mdDoc = new md()
		,	totalCount = result.totalCount || 0
		,	hitCount = result.hitCount || 0
		,	hitRate = result.hitRate || 0
		,	maxCount = result.maxCount || 0
		,	minCount = result.minCount || 0
		,	averageCount = result.averageCount || 0
		,	hitTable = result.hitTable || new Map
		mdDoc.appendText("total count : " + totalCount)
		mdDoc.appendText("hit count : " + hitCount)
		mdDoc.appendText("hit rate : " + hitRate)
		mdDoc.appendText("max count : " + maxCount)
		mdDoc.appendText("min count : " + minCount)
		mdDoc.appendText("average count : " + averageCount)
		let mdTable = mdDoc.createTable()
		mdTable.appendHead("browser name", "hit count")
		for(let name of hitTable.keys()){
			mdTable.appendRow(name, hitTable.get(name))
		}
		mdDoc.appendTable(mdTable.getMD())
	})
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
		,	unfitTable = result.unfitTable || new Map()

		,	splited = resultFilePath ? resultFilePath.split(".") : []
		,	suffix = splited.length > 0 ? splited[splited.length - 1] : ''

		if(suffix === "html"){
			//输出html格式结果.

		}else if(suffix === "md"){
			//输出md格式结果.

		}else{
			//直接输出在屏幕. （屏幕输出暂时不输出unfitTable信息.）
			show.multiline(
				"fit count : " + fitCount,
				"unfit count : " + unfitCount,
				"total count : " + totalCount,
				"fit rate : " + fitRate,
				"unfit table : " + unfitTable
			)
		}
		console.log("compare finish.")
	})
}else{
	console.error('err: unknown command, please enter "node index.js help" for more options.')
}