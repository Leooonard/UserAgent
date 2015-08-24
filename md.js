'use strict'

let md = function(){
	let mdText = ""

	this.appendText = (text) => {
		mdText = mdText.concat("### ", text, "\n")
	}

	this.getMD = () => mdText

	this.appendTable = (table) => {
		mdText = mdText.concat(table, "\n")
	}

	this.createTable = () => new table
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
	}

	this.appendRow = () => {
		if(!hasHead){
			return
		}
		let cells = [].slice.call(arguments)
		for(let i = 0 ; i < headCount ; i++){
			let cell = cells[i]
			if(cell !== undefined){
				mdText = mdText.concat("|", cell)
			}else{
				mdText = mdText.concat("|", "")
			}
		}
		mdText = mdText.concat("|\n")
	}
}

module.exports = md