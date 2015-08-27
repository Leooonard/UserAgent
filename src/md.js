'use strict'

let showdown = require("showdown")
,	converter = new showdown.Converter({
	tables: true,
})

let md = function(){
	let mdText = ""

	this.appendText = (text) => {
		mdText = mdText.concat("### ", text, "\n")
	}

	this.appendMultilineText = (textArray) => {
		let multilineText = ""
		for(let text of textArray){
			multilineText = multilineText.concat(text, "<br>")
		}
		mdText = mdText.concat(multilineText, "\n")
	}

	this.getMD = () => mdText

	this.appendTable = (table) => {
		mdText = mdText.concat(table, "\n")
	}

	this.createTable = () => new table

	this.toHTML = () => pretty(converter.makeHtml(mdText))
}

let pretty = function(htmlStr){
	let style = "\
		<style>\
			table{\
				border-collapse: collapse;\
				border-spacing: 0;\
				line-height: 1.6;\
			}\
			tr:nth-child(even){\
				background-color: white;\
			}\
			tr:nth-child(odd){\
				background-color: rgb(248, 248, 248);\
			}\
			td{\
				border: solid 1px rgb(221, 221, 221);\
			}\
		</style>\
	"
	return htmlStr.concat(style)
}

let table = function(){
	let mdText = ""
	,	hasHead = false
	,	headCount = 0

	this.getMD = () => mdText

	this.appendHead = () => {
		if(hasHead){
			return
		}
		let heads = [].slice.call(arguments)
		headCount = heads.length
		for(let head of heads){
			mdText = mdText.concat("|", head)
		}
		mdText = mdText.concat("|\n")
		for(let i = 0 ; i < headCount ; i++){
			mdText = mdText.concat("|---")
		}
		mdText = mdText.concat("|\n")
		hasHead = true
	}

	this.appendRow = () => {
		if(!hasHead){
			return
		}
		let cells = [].slice.call(arguments)
		for(let i = 0 ; i < headCount ; i++){
			let cell = cells[i]
			if(cell !== undefined){
				cell = cell.trim("\n")
				mdText = mdText.concat("|", cell)
			}else{
				mdText = mdText.concat("|", "")
			}
		}
		mdText = mdText.concat("|\n")
	}
}

module.exports = md