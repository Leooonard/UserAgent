// 将json对象转换为真正的js对象.

/*
	原来的json对象.
	[
		{
			name: 浏览器名,
			test: 测试ua的字符串, 字符串数组或正则,
			type: string | array | regexp,
			flag: string, //当type为regexp时, 表明正则使用的标记. 当type为string或array时, 表明指定在ua中的位置.
			hardtest: string | null //测试ua的正则, 仅当test为字符串或字符串数组时使用, 用于判断出ua的版本号,
			hardflag: string, //hardtest正则使用的标记,
			optimizer: 优化器的名字 | "null",
			children: [ //子测试对象 | "null"
				{}, //同样的对象结构.
				...
			]
		}
		...
	]

	生成后的js对象.
	[
		{
			name:  浏览器名,
			test: function(){},
			hardtest: function(){},
			optimizer: function(){},
			children: [
				{},
				...
			]
		}
	]
*/

'use strict';

var optimizer = require("./optimizer.js");

//检查一组字符串是否在目标字符串中按顺序出现.
var containsSequence = function containsSequence(str, segements, start) {
	var minPos = -1,
	    startFlag = typeof start === "number";
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = segements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var segement = _step.value;

			var tempPos = str.indexOf(segement);
			if (tempPos === -1 || tempPos < minPos) {
				return false;
			}
			if (startFlag) {
				startFlag = false;
				if (tempPos !== start) {
					return false;
				}
			}
			minPos = tempPos;
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

	return true;
};

var generate = function generate(jsonObjs) {
	var objArray = [];

	var _iteratorNormalCompletion2 = true;
	var _didIteratorError2 = false;
	var _iteratorError2 = undefined;

	try {
		var _loop = function () {
			var jsonObj = _step2.value;

			var obj = {
				name: jsonObj.name || ""
			};

			var flag = jsonObj.flag,
			    test = jsonObj.test,
			    type = jsonObj.type,
			    hardtest = jsonObj.hardtest,
			    hardflag = jsonObj.hardflag,
			    optimizer = jsonObj.optimizer,
			    children = jsonObj.children;

			if (type === "string") {
				if (flag === "null") {
					obj.test = function (ua) {
						return ua.indexOf(test) !== -1;
					};
				} else {
					flag = parseInt(flag);
					obj.test = function (ua) {
						return ua.indexOf(test) === flag;
					};
				}
			} else if (type === "array") {
				if (flag === "null") {
					obj.test = function (ua) {
						return containsSequence(ua, test);
					};
				} else {
					flag = parseInt(flag);
					obj.test = function (ua) {
						return containsSequence(ua, test, flag);
					};
				}
			} else {
				(function () {
					var regex = undefined;
					if (flag === "null") {
						regex = new RegExp(test);
					} else {
						regex = new RegExp(test, flag);
					}
					obj.test = function (ua) {
						return regex.exec(ua);
					};
				})();
			}

			if (type !== "regexp" && hardtest !== "null") {
				(function () {
					var regex = undefined;
					if (hardflag === "null") {
						regex = new RegExp(hardtest);
					} else {
						regex = new RegExp(hardtest, hardflag);
					}
					obj.hardtest = function (ua) {
						return regex.exec(ua);
					};
				})();
			}

			if (jsonObj.optimizer !== "null") {
				obj.optimizer = optimizer[jsonObj.optimizer];
			}

			if (children !== "null") {
				obj.children = generate(children);
			}

			objArray.push(obj);
		};

		for (var _iterator2 = jsonObjs[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
			_loop();
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

	return objArray;
};