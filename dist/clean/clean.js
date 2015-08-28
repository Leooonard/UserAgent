'use strict';

var spiders = require("./spider.json"),
    linebylineReader = require("line-by-line"),
    fs = require("fs"),
    targetFd = undefined;

var clean = function clean(src, target, callback) {
	if (!fs.existsSync(src)) {
		throw new Error("src file is not exist.");
	}

	targetFd = fs.openSync(target, "w+");

	var lineReader = new linebylineReader(src);
	lineReader.on("err", function (err) {
		throw {
			name: "ReadError",
			msg: err
		};
	});

	lineReader.on("line", function (line) {
		var ua = line;
		if (!test(ua)) {
			fs.write(targetFd, ua + "\n");
		}
	});

	lineReader.on("end", function () {
		fs.close(targetFd);
		typeof callback === "function" && callback();
	});
};

var test = function test(ua) {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = spiders[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var spider = _step.value;

			var regex = new RegExp(spider, "i");
			var result = regex.exec(ua);
			if (!!result) {
				return true;
			}
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator["return"]) {
				_iterator["return"]();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	return false;
};

module.exports = clean;