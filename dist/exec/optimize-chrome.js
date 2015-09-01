'use strict';

var TARGET_NAME = "chrome",
    CHROME_SEGEMENTS = ["AppleWebkit", "Chrome/", "Safari/"],
    CHROME_FEATURE = "(KHTML, like Gecko)";

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

	if (ua.indexOf(CHROME_FEATURE) != -1) {
		ua = ua.replace(CHROME_FEATURE, "");
	} else {
		return false;
	}

	var closeParentPos = -1;

	for (var i = 0; i < ua.length; i++) {
		if (ua.charAt(i) === ")") {
			closeParentPos = i;
		}
	}

	if (closeParentPos === -1) {
		return false;
	}

	ua = ua.slice(closeParentPos + 1); //闭括号后的提出来.
	var segements = ua.split(" ");

	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = segements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var segement = _step.value;

			if (segement === "") continue;
			var flag = false;
			var _iteratorNormalCompletion2 = true;
			var _didIteratorError2 = false;
			var _iteratorError2 = undefined;

			try {
				for (var _iterator2 = CHROME_SEGEMENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
					var chromeSegement = _step2.value;

					segement = segement.trim();
					segement = segement.toLowerCase();
					if (segement.indexOf(chromeSegement.toLowerCase()) === 0) {
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