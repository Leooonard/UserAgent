'use strict';

var linebylineReader = require("line-by-line"),
    fs = require("fs"),
    path = require("path"),
    show = require("../show.js"),
    uaList = require("../../static/ua.json"),
    cache = require("./cache.js"),
    UA = require("./ua.js"),
    ieOptimize = require("./optimize-ie.js"),
    chromeOptimize = require("./optimize-chrome.js"),
    logFd = undefined,
    resultFd = undefined;

//将json转换为map.
Object.keys(uaList.L1).forEach(function (val, idx, array) {
	uaList.L1[val] = new RegExp(uaList.L1[val], "i");
});
Object.keys(uaList.L2).forEach(function (val, idx, array) {
	Object.keys(uaList.L2[val]).forEach(function (v, i, arr) {
		uaList.L2[val][v] = new RegExp(uaList.L2[val][v], "i");
	});
});

var HitTable = function HitTable() {
	var hitMap = {};

	this.add = function (ua) {
		if (ua instanceof UA) {
			var family = ua.getFamily(),
			    version = ua.getVersion();
			if (hitMap[family] !== undefined) {
				var map = hitMap[family];
				if (map[version] !== undefined) {
					map[version] = map[version] + 1;
				} else {
					map[version] = 1;
				}
			} else {
				var map = {};
				map[version] = 1;
				hitMap[family] = map;
			}
		}
	};

	this.get = function () {
		return hitMap;
	};
};

var Counter = function Counter() {
	var uaCount = 0,
	    totalCount = 0,
	    hitCount = 0,
	    maxCount = 0,
	    minCount = Infinity,
	    counterTable = {};

	this.add = function (success, counter) {
		if (!!success) {
			hitCount++;
		}
		uaCount++;
		totalCount += counter;

		if (counter > maxCount) {
			maxCount = counter;
		}
		if (counter < minCount) {
			minCount = counter;
		}

		if (!!success) {
			if (counterTable[counter] !== undefined) {
				counterTable[counter] = counterTable[counter] + 1;
			} else {
				counterTable[counter] = 1;
			}
		}
	};

	this.get = function () {
		return {
			uaCount: uaCount,
			totalCount: totalCount,
			hitCount: hitCount,
			maxCount: maxCount,
			minCount: minCount,
			hitRate: hitCount / uaCount,
			averageCount: totalCount / uaCount
		};
	};
};

/*
	input: ua string
	output: {
		result: ua object,
		counter: number,
	}
*/
var test = function test(ua, useCache, useOptimization) {
	var counter = 0,
	    mixCounter = function mixCounter(obj) {
		obj.counter = counter;
		return obj;
	},
	    success = function success(uaObject) {
		if (!!useCache) {
			cache.load(ua, uaObject);
		}
		fs.writeSync(logFd, "-------------------------\n");
		fs.writeSync(resultFd, uaObject.getFamily() + "\n");
		return mixCounter({
			result: uaObject
		});
	},
	    fail = function fail() {
		fs.writeSync(logFd, "-------------------------\n");
		fs.writeSync(resultFd, "Other\n");
		return mixCounter({
			result: false
		});
	};

	if (!!useCache) {
		var cacheResult = cache.match(ua);
		counter += cacheResult.counter;
		if (!!cacheResult.UA) {
			return success(cacheResult.UA);
		}
	}

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = Object.keys(uaList.L1)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var lv1Name = _step.value;

			counter++;
			var lv1Regex = uaList.L1[lv1Name];
			fs.writeSync(logFd, "LV1 : " + lv1Regex.source + "\n");
			var lv1Result = lv1Regex.exec(ua);
			if (!!lv1Result) {
				if (uaList.L2[lv1Name] !== undefined) {
					//先做优化判断.
					if (!!useOptimization) {
						console.log(ua);
						if (ieOptimize.optimize(ua, lv1Name)) {
							return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]));
						}
						if (chromeOptimize.optimize(ua, lv1Name)) {
							return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]));
						}
					}

					var lv2Obj = uaList.L2[lv1Name];
					var _iteratorNormalCompletion2 = true;
					var _didIteratorError2 = false;
					var _iteratorError2 = undefined;

					try {
						for (var _iterator2 = Object.keys(lv2Obj)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
							var lv2Name = _step2.value;

							counter++;
							var lv2Regex = lv2Obj[lv2Name];
							fs.writeSync(logFd, "LV2 : " + lv2Regex.source + "\n");
							var lv2Result = lv2Regex.exec(ua);
							if (!!lv2Result) {
								return success(new UA(lv2Name, lv2Result[1], lv2Result[2], lv2Result[3]));
							}
						}
					} catch (err) {
						_didIteratorError2 = true;
						_iteratorError2 = err;
					} finally {
						try {
							if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
								_iterator2["return"]();
							}
						} finally {
							if (_didIteratorError2) {
								throw _iteratorError2;
							}
						}
					}

					return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]));
				} else {
					return success(new UA(lv1Name, lv1Result[1], lv1Result[2], lv1Result[3]));
				}
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

	return fail();
};

var exec = function exec(ua, option, callback) {
	var uaList = [],
	    hitTable = new HitTable(),
	    counter = new Counter();

	logFd = fs.openSync(path.join(__dirname, "../../static/exec-log.log"), "w");
	resultFd = fs.openSync(path.join(__dirname, "../../static/exec-result.log"), "w");

	if (option.useFile) {
		execFromFile(ua, option.useCache, option.useOptimization, callback);
	} else {
		execFromString(ua, option.useCache, option.useOptimization, callback);
	}
};

var execFromString = function execFromString(src, useCache, useOptimization, callback) {
	var result = test(src.toString(), useCache, useOptimization).result;
	typeof callback === "function" && callback(result);
};

var execFromArray = function execFromArray(srcArray, option, callback) {
	if (!(srcArray instanceof Array)) {
		return [];
	} else {
		var uaArray = [];
		var _iteratorNormalCompletion3 = true;
		var _didIteratorError3 = false;
		var _iteratorError3 = undefined;

		try {
			for (var _iterator3 = srcArray[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
				var ua = _step3.value;

				var result = test(ua.toString(), !!option.useCache, !!option.useOptimization);
				uaArray.push(result);
			}
		} catch (err) {
			_didIteratorError3 = true;
			_iteratorError3 = err;
		} finally {
			try {
				if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
					_iterator3["return"]();
				}
			} finally {
				if (_didIteratorError3) {
					throw _iteratorError3;
				}
			}
		}

		callback(uaArray);
	}
};

var execFromFile = function execFromFile(src, useCache, useOptimization) {
	if (!fs.existsSync(src)) {
		throw new Error("src file is not exist.");
	}

	var lineReader = new linebylineReader(src),
	    hitTable = new HitTable(),
	    counter = new Counter();

	logFd = fs.openSync(path.join(__dirname, "exec-log.log"), "w");
	resultFd = fs.openSync(path.join(__dirname, "exec-result.log"), "w");

	lineReader.on("err", function (err) {
		throw new Error(err);
	});

	lineReader.on("line", function (line) {
		var result = test(line, useCache, useOptimization);
		counter.add(!!result.result, result.counter);
		hitTable.add(result.result);
	});

	lineReader.on("end", function () {
		var result = counter.get();
		result.hitTable = hitTable.get();

		typeof callback === "function" && callback(result);
	});
};

module.exports = {
	exec: exec,
	analyze: execFromArray
};