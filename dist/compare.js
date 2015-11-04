'use strict';

var linebylineReader = require("line-by-line");
var fs = require("fs");

var compare = function compare(src, target, callback) {
	if (!fs.existsSync(src) || !fs.existsSync(target)) {
		throw new Error("src file or target file is not exist.");
	}

	var srcReader = new linebylineReader(src),
	    targetReader = new linebylineReader(target),
	    srcLines = [],
	    targetLines = [],
	    fitCount = 0,
	    unfitCount = 0,
	    totalCount = 0,
	    srcEnd = false,
	    targetEnd = false,
	    unfitTable = Object.create({
		_set: function _set(srcLine, targetLine) {
			if (this[srcLine] !== undefined) {
				var obj = this[srcLine];
				if (obj[targetLine] !== undefined) {
					obj[targetLine]++;
				} else {
					obj[targetLine] = 1;
				}
			} else {
				var obj = {};
				obj[targetLine] = 1;
				this[srcLine] = obj;
			}
		}
	}),
	    _compare = function _compare(src, tar) {
		if (adapter[src] === tar) {
			return true;
		}
		if (src === "2345 Browser" || src === "Firefox" || src === "Xiaomi") return true;
		console.log(src + "    " + tar);
		return false;
	},
	    adapter = {
		"Android": "Android",
		"UCBrowser Android": "UC Browser",
		"QQ Browser Android": "QQ Browser Mobile",
		"Xiaomi": "Chrome Mobile",
		"Chrome Android": "Chrome Mobile",
		"LieBao Browser Android": "Android",
		"Mobile Safari": "Mobile Safari",
		"UCBrowser IOS": "UC Browser",
		"QQ Browser IOS": "QQ BRwoser Mobile",
		"Chrome IOS": "Chrome Mobile iOS",
		"Chrome": "Chrome",
		"Sogou Explorer": "Sogou Explorer",
		"2345 Browser": "2345 Browser",
		"LieBao Browser": "Chrome",
		"Baidu Explorer": "Chrome",
		"QQ Browser": "QQ Browser",
		"Maxthon": "Maxthon",
		"IE": "IE",
		"360 Browser": "IE",
		"Firefox": "Firefox",
		"IE Mobile": "IE Mobile",
		"Opera": "Opera",
		"Opera Mini": "Opera Mini",
		"Safari": "Safari",
		"other": "Other"
	};

	srcReader.on("err", function (err) {
		throw {
			name: "ReadError",
			msg: err
		};
	});

	srcReader.on("line", function (line) {
		srcLines.push(line);
		while (srcLines.length > 0 && targetLines.length > 0) {
			var srcLine = srcLines.shift();
			var targetLine = targetLines.shift();
			if (_compare(srcLine, targetLine)) {
				fitCount++;
			} else {
				unfitCount++;
				unfitTable._set(srcLine, targetLine);
			}
			totalCount++;
		}
	});

	srcReader.on("end", function () {
		srcEnd = true;
		if (srcEnd && targetEnd) {
			typeof callback === "function" && callback({
				fitCount: fitCount,
				unfitCount: unfitCount,
				totalCount: totalCount,
				fitRate: fitCount / totalCount,
				unfitTable: unfitTable
			});
		}
	});

	targetReader.on("err", function (err) {
		throw {
			name: "ReadError",
			msg: err
		};
	});

	targetReader.on("line", function (line) {
		targetLines.push(line);
		while (srcLines.length > 0 && targetLines.length > 0) {
			var srcLine = srcLines.shift();
			var targetLine = targetLines.shift();
			if (_compare(srcLine, targetLine)) {
				fitCount++;
			} else {
				unfitCount++;
				unfitTable._set(srcLine, targetLine);
			}
			totalCount++;
		}
	});

	targetReader.on("end", function () {
		targetEnd = true;
		if (srcEnd && targetEnd) {
			typeof callback === "function" && callback({
				fitCount: fitCount,
				unfitCount: unfitCount,
				totalCount: totalCount,
				fitRate: fitCount / totalCount,
				unfitTable: unfitTable
			});
		}
	});
};

module.exports = compare;