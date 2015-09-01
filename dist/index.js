#!/usr/bin/env node


'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var ut = require('util'),
    fs = require("fs"),
    clean = require('./clean.js'),
    compare = require("./compare.js"),
    show = require("./show.js"),
    exec = require("./exec/exec.js"),
    md = require("./md.js");

var HELP_COMMAND = "help";
var CLEAN_COMMAND = "clean";
var COMPARE_COMMAND = "compare";
var EXEC_COMMAND = "exec";

var args = process.argv.slice(2),
    command = args.length === 0 ? '' : args.shift().toLowerCase();

if (command === HELP_COMMAND) {
	console.log('\
command list:\n\
	exec - analyze the ua log, return analyzed info. like ua exec [-cof] src [result]\n\
		option c: use cache (default false)\n\
		option o: use optimization for ie and chrome (default false)\n\
		option f: src is a file (default string)\n\
		result should the be a file path and end with .md or .html\n\
	clean - filter the spiders in the ua log. like ua clean src target\n\
	compare - compare two results. like ua compare src target [result]\n\
		result should the be a file path and end with .md or .html\n\
	help - print help');
} else if (command === EXEC_COMMAND) {
	(function () {
		var CACHE_FLAG = '-c';

		var _args = _slicedToArray(args, 3);

		var option = _args[0];
		var srcFilePath = _args[1];
		var resultFilePath = _args[2];

		if (args.length === 1) {
			srcFilePath = option;
			option = undefined;
			resultFilePath = undefined;
		} else if (args.length === 2) {
			var regex = /^-([cof])(?:(?=$)|(?!\1))([cof])?(?:(?=$)|(?!(?:\1|\2)))([cof])?$/i;
			if (!regex.test(option)) {
				resultFilePath = srcFilePath;
				srcFilePath = option;
				option = undefined;
			}
		}

		if (!srcFilePath) {
			throw new Error("err: missing src argument.");
		}

		var defaultOption = {
			useCache: false,
			useOptimization: false,
			useFile: false
		};
		//搞定option对象.
		if (!option || option[0] !== "-") {
			option = defaultOption;
		} else {
			var useCache = false,
			    useOptimization = false,
			    useFile = false,
			    regex = /^-([cof])(?:(?=$)|(?!\1))([cof])?(?:(?=$)|(?!(?:\1|\2)))([cof])?$/i,
			    result = regex.exec(option);
			if (result === null) {
				option = defaultOption;
			} else {
				for (var i = 1; i < 4; i++) {
					var opt = result[i];
					if (opt === "c") {
						useCache = true;
					} else if (opt === "o") {
						useOptimization = true;
					} else if (opt === "f") {
						useFile = true;
					}
				}
				option = {
					useCache: useCache,
					useOptimization: useOptimization,
					useFile: useFile
				};
			}
		}

		var startTimer = new Date().getTime(),
		    endTimer = -1;
		exec.exec(srcFilePath, option, function (result) {
			endTimer = new Date().getTime();

			if (!option.useFile) {
				//只验证一句ua的话, 直接输出分析结果即可.
				console.log(result.getFamily() + ":" + result.getVersion());
				return;
			}

			var _result$totalCount = result.totalCount;
			var totalCount = _result$totalCount === undefined ? 0 : _result$totalCount;
			var _result$hitCount = result.hitCount;
			var hitCount = _result$hitCount === undefined ? 0 : _result$hitCount;
			var _result$hitRate = result.hitRate;
			var hitRate = _result$hitRate === undefined ? 0 : _result$hitRate;
			var _result$maxCount = result.maxCount;
			var maxCount = _result$maxCount === undefined ? 0 : _result$maxCount;
			var _result$minCount = result.minCount;
			var minCount = _result$minCount === undefined ? 0 : _result$minCount;
			var _result$averageCount = result.averageCount;
			var averageCount = _result$averageCount === undefined ? 0 : _result$averageCount;
			var _result$hitTable = result.hitTable;
			var hitTable = _result$hitTable === undefined ? {} : _result$hitTable;
			var splited = resultFilePath ? resultFilePath.split(".") : [];
			var suffix = splited.length > 0 ? splited[splited.length - 1] : '';

			if (suffix === "html" || suffix === "md") {
				var mdDoc = new md();

				mdDoc.appendText("use time : " + (endTimer - startTimer) + "ms");
				mdDoc.appendText("total count : " + totalCount);
				mdDoc.appendText("hit count : " + hitCount);
				mdDoc.appendText("hit rate : " + (hitRate * 100).toFixed(2) + "%");
				mdDoc.appendText("max count : " + maxCount);
				mdDoc.appendText("min count : " + minCount);
				mdDoc.appendText("average count : " + averageCount.toFixed(2));
				var mdTable = mdDoc.createTable();
				mdTable.appendHead("browser name", "browser version", "count");
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = Object.keys(hitTable)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var _name = _step.value;

						var versionRow = new md(),
						    countRow = new md(),
						    versionArray = [],
						    countArray = [];
						var _iteratorNormalCompletion2 = true;
						var _didIteratorError2 = false;
						var _iteratorError2 = undefined;

						try {
							for (var _iterator2 = Object.keys(hitTable[_name])[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
								var version = _step2.value;

								versionArray.push(version);
								countArray.push(hitTable[_name][version]);
							}
						} catch (err) {
							_didIteratorError2 = true;
							_iteratorError2 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion2 && _iterator2['return']) {
									_iterator2['return']();
								}
							} finally {
								if (_didIteratorError2) {
									throw _iteratorError2;
								}
							}
						}

						versionRow.appendMultilineText(versionArray);
						countRow.appendMultilineText(countArray);
						mdTable.appendRow(_name, versionRow.getMD(), countRow.getMD());
					}
				} catch (err) {
					_didIteratorError = true;
					_iteratorError = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion && _iterator['return']) {
							_iterator['return']();
						}
					} finally {
						if (_didIteratorError) {
							throw _iteratorError;
						}
					}
				}

				mdDoc.appendTable(mdTable.getMD());

				var fd = fs.openSync(resultFilePath, "w+");
				if (suffix === "html") {
					fs.writeSync(fd, mdDoc.toHTML());
				} else if (suffix === "md") {
					fs.writeSync(fd, mdDoc.getMD());
				}
			}

			show.multiline("exec finish", "use time : " + (endTimer - startTimer) + "ms", "total count : " + totalCount, "hit count : " + hitCount, "hit rate : " + (hitRate * 100).toFixed(2) + "%", "max count : " + maxCount, "min count : " + minCount, "average count : " + averageCount.toFixed(2));
		});
	})();
} else if (command === CLEAN_COMMAND) {
	var srcFilePath = args[1];
	var targetFilePath = args[2];
	if (!srcFilePath || !targetFilePath) {
		throw new Error('err: missing src or target argument.');
	}

	clean(srcFilePath, targetFilePath, function () {
		console.log("clean finish.");
	});
} else if (command === COMPARE_COMMAND) {
	(function () {
		var srcFilePath = args[1];
		var targetFilePath = args[2];
		var resultFilePath = args[3];
		if (!srcFilePath || !targetFilePath) {
			throw new Error("err: missing src or target argument.");
		}

		compare(srcFilePath, targetFilePath, function (result) {
			var _result$fitCount = result.fitCount;
			var fitCount = _result$fitCount === undefined ? 0 : _result$fitCount;
			var _result$unfitCount = result.unfitCount;
			var unfitCount = _result$unfitCount === undefined ? 0 : _result$unfitCount;
			var _result$totalCount2 = result.totalCount;
			var totalCount = _result$totalCount2 === undefined ? 0 : _result$totalCount2;
			var _result$fitRate = result.fitRate;
			var fitRate = _result$fitRate === undefined ? 0 : _result$fitRate;
			var _result$unfitTable = result.unfitTable;
			var unfitTable = _result$unfitTable === undefined ? {} : _result$unfitTable;
			var splited = resultFilePath ? resultFilePath.split(".") : [];
			var suffix = splited.length > 0 ? splited[splited.length - 1] : '';

			if (suffix === "html" || suffix === "md") {
				var mdDoc = new md();

				mdDoc.appendText("total count : " + totalCount);
				mdDoc.appendText("fit count : " + fitCount);
				mdDoc.appendText("unfit count : " + unfitCount);
				mdDoc.appendText("fit rate : " + (fitRate * 100).toFixed(2) + "%");

				var mdTable = mdDoc.createTable();
				mdTable.appendHead("src name", "target name", "count");
				var _iteratorNormalCompletion3 = true;
				var _didIteratorError3 = false;
				var _iteratorError3 = undefined;

				try {
					for (var _iterator3 = Object.keys(unfitTable)[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
						var srcName = _step3.value;

						var targetRow = new md(),
						    countRow = new md(),
						    targetArray = [],
						    countArray = [];
						var _iteratorNormalCompletion4 = true;
						var _didIteratorError4 = false;
						var _iteratorError4 = undefined;

						try {
							for (var _iterator4 = Object.keys(unfitTable[srcName])[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
								var targetName = _step4.value;

								targetArray.push(targetName);
								countArray.push(unfitTable[srcName][targetName]);
							}
						} catch (err) {
							_didIteratorError4 = true;
							_iteratorError4 = err;
						} finally {
							try {
								if (!_iteratorNormalCompletion4 && _iterator4['return']) {
									_iterator4['return']();
								}
							} finally {
								if (_didIteratorError4) {
									throw _iteratorError4;
								}
							}
						}

						targetRow.appendMultilineText(targetArray);
						countRow.appendMultilineText(countArray);
						mdTable.appendRow(srcName, targetRow.getMD(), countRow.getMD());
					}
				} catch (err) {
					_didIteratorError3 = true;
					_iteratorError3 = err;
				} finally {
					try {
						if (!_iteratorNormalCompletion3 && _iterator3['return']) {
							_iterator3['return']();
						}
					} finally {
						if (_didIteratorError3) {
							throw _iteratorError3;
						}
					}
				}

				mdDoc.appendTable(mdTable.getMD());

				var fd = fs.openSync(resultFilePath, "w+");
				if (suffix === "html") {
					fs.writeSync(fd, mdDoc.toHTML());
				} else if (suffix === "md") {
					fs.writeSync(fd, mdDoc.getMD());
				}
			}

			//直接输出在屏幕. （屏幕输出暂时不输出unfitTable信息.）
			show.multiline("fit count : " + fitCount, "unfit count : " + unfitCount, "total count : " + totalCount, "fit rate : " + fitRate);
		});
	})();
} else {
	console.error('err: unknown command, please enter "ua help" for more options.');
}