'use strict';

var ut = require('util'),
    fs = require("fs"),
    clean = require('./dist/clean/clean.js'),
    compare = require("./dist/compare.js"),
    show = require("./dist/show.js"),
    execFromFile = require("./dist/exec/exec.js").execFromFile,
    exec = require("./dist/exec/exec.js").exec,
    md = require("./dist/md.js");

var HELP_COMMAND = "help";
var CLEAN_COMMAND = "clean";
var COMPARE_COMMAND = "compare";
var EXEC_COMMAND = "exec";

var args = process.argv.slice(2);
var command = args.length === 0 ? '' : args[0].toLowerCase();

if (command === HELP_COMMAND) {
	console.log('\
use this like "node index.js command file"\n\
command:\n\
	exec - analyze the ua log, return analyzed info. like node index.js exec [-c] src [result]\n\
	clean - filter the spiders in the ua log. like node index.js clean src target\n\
	compare - compare two results. like node index.js compare src target [result]\n\
	help - print help.');
} else if (command === EXEC_COMMAND) {
	(function () {
		var CACHE_FLAG = '-c';

		var useCache = args[1],
		    srcFilePath = args[2],
		    resultFilePath = args[3];

		if (args.length === 2) {
			srcFilePath = useCache;
			useCache = undefined;
		} else if (args.length === 3) {
			if (useCache !== CACHE_FLAG) {
				resultFilePath = srcFilePath;
				srcFilePath = useCache;
				useCache = undefined;
			}
		}

		if (!srcFilePath) {
			throw new Error("err: missing file path, use this command like node index.js exec [-c] src [result]");
		}

		var startTimer = new Date().getTime();
		execFromFile(srcFilePath, function (result) {
			var endTimer = new Date().getTime();
			console.log(endTimer - startTimer);
			var mdDoc = new md(),
			    totalCount = result.totalCount || 0,
			    hitCount = result.hitCount || 0,
			    hitRate = result.hitRate || 0,
			    maxCount = result.maxCount || 0,
			    minCount = result.minCount || 0,
			    averageCount = result.averageCount || 0,
			    hitTable = result.hitTable || {},
			    splited = resultFilePath ? resultFilePath.split(".") : [],
			    suffix = splited.length > 0 ? splited[splited.length - 1] : '';

			if (suffix === "html" || suffix === "md") {
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
			show.multiline("total count : " + totalCount, "hit count : " + hitCount, "hit rate : " + hitRate, "max count : " + maxCount, "min count : " + minCount, "average count : " + averageCount);
		}, useCache === CACHE_FLAG); //是否使用缓存
	})();
} else if (command === CLEAN_COMMAND) {
		var srcFilePath = args[1];
		var targetFilePath = args[2];
		if (!srcFilePath || !targetFilePath) {
			throw new Error('err: missing file path, use this command like node index.js clean src target.');
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
				throw new Error("err: missing file path, use this command like node index.js compare src target.");
			}

			compare(srcFilePath, targetFilePath, function (result) {
				var fitCount = result.fitCount || 0,
				    unfitCount = result.unfitCount || 0,
				    totalCount = result.totalCount || 0,
				    fitRate = result.fitRate || 0,
				    unfitTable = result.unfitTable || {},
				    mdDoc = new md(),
				    splited = resultFilePath ? resultFilePath.split(".") : [],
				    suffix = splited.length > 0 ? splited[splited.length - 1] : '';

				if (suffix === "html" || suffix === "md") {
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
		console.error('err: unknown command, please enter "node index.js help" for more options.');
	}
