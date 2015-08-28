'use strict';

var UA = function UA(family, main, minor, patch) {
	this.getVersion = function () {
		var mainVersion = main === undefined ? "null" : main,
		    minorVersion = minor === undefined ? "null" : minor,
		    patchVersion = patch === undefined ? "null" : patch,
		    version = mainVersion + "." + minorVersion + "." + patchVersion;
		version = version.replace(/(\.null)*$/ig, "");

		return version;
	};

	this.getFamily = function () {
		return family;
	};
};

module.exports = UA;