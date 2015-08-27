'use strict'

let UA = function(family, main, minor, patch){
	this.getVersion = () => {
		let mainVersion = main === undefined ? "null" : main
		,	minorVersion = minor === undefined ? "null" : minor
		,	patchVersion = patch === undefined ? "null" : patch
		,	version = mainVersion + "." + minorVersion + "." + patchVersion
		version = version.replace(/(\.null)*$/ig, "")

		return version
	}

	this.getFamily = () => family
}

module.exports = UA