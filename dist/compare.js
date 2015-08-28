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
	});

	srcReader.on("err", function (err) {
		throw {
			name: "ReadError",
			msg: err
		};
	});

	srcReader.on("line", function (line) {
		srcLines.push(line);
		while (srcLines.length > 0 && targetLines.length > 0) {
			var srcLine = srcLines.shift().toLowerCase();
			var targetLine = targetLines.shift().toLowerCase();
			if (srcLine === targetLine) {
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
			var srcLine = srcLines.shift().toLowerCase();
			var targetLine = targetLines.shift().toLowerCase();
			if (srcLine === targetLine) {
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