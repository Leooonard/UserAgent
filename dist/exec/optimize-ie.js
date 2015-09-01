'use strict';

var TARGET_NAME = "ie";
var IE_SEGEMENTS = ["compatible", "MSIE", "Windows", ".NET", "Win64", "x64", "IA64", "WOW64", "Trident"];

var isTarget = function isTarget(name) {
	if (typeof name === "string" && TARGET_NAME === name.toLowerCase()) {
		return true;
	} else {
		return false;
	}
};

var optimize = function optimize(ua, name) {
	if (typeof ua !== "string" || !isTarget(name)) {
		return false;
	}
	var openParentCount = 0,
	    openParentPos = -1,
	    closeParentCount = 0;

	for (var i = 0; i < ua.length; i++) {
		if (ua.charAt(i) === "(") {
			openParentCount++;
			openParentPos = i;
		} else if (ua.charAt(i) === ")") {
			closeParentCount++;
		}
	}

	if (openParentCount !== 1 || closeParentCount !== 1 || ua[ua.length - 1] !== ")") {
		return false;
	}

	ua = ua.slice(openParentPos + 1, -1); //括号中间的提出来.
	var segements = ua.split(";");

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = segements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var segement = _step.value;

			var flag = false;
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = IE_SEGEMENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var ieSegement = _step2.value;

					segement = segement.trim();
					segement = segement.toLowerCase();
					if (segement.indexOf(ieSegement.toLowerCase()) === 0) {
						flag = true;
						break;
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

			if (!flag) {
				return false;
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

	return true;
};

exports.optimize = optimize;