//directly decide useragent

"use strict";

function IE(ua) {
    var IE_SEGEMENTS = ["compatible", "MSIE", "Windows", ".NET", "Win64", "x64", "IA64", "WOW64", "Trident"];

    if (typeof ua !== "string") {
        return false;
    }

    var openParentPos = -1;

    if ((openParentPos = ua.indexOf("(")) === -1 || ua.charAt(ua.length - 1) !== ")") {
        return false;
    }

    ua = ua.slice(openParentPos + 1, -1);
    if (ua.indexOf("(") !== -1 || ua.indexOf(")") !== -1) {
        return false;
    }

    var segements = ua.split(";");

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = segements[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var segement = _step.value;

            segement = segement.trim().toLowerCase();
            var flag = false;
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = IE_SEGEMENTS[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var ieSegement = _step2.value;

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
}

function Chrome(ua) {
    var CHROME_SEGEMENTS = ["AppleWebkit", "Chrome/", "Safari/"],
        CHROME_FEATURE = "(KHTML, like Gecko)";

    if (typeof ua !== "string") {
        return false;
    }

    if (ua.indexOf(CHROME_FEATURE) !== -1) {
        ua = ua.replace(CHROME_FEATURE, "");
    } else {
        return false;
    }

    var closeParentPos = -1;
    if ((closeParentPos = ua.lastIndexOf(")")) === -1) {
        return false;
    }

    ua = ua.slice(closeParentPos + 1); //闭括号后的提出来.
    var segements = ua.split(" ");

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = segements[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var segement = _step3.value;

            if (segement === "") {
                continue;
            }
            segement = segement.trim().toLowerCase();
            var flag = false;
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
                for (var _iterator4 = CHROME_SEGEMENTS[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                    var chromeSegement = _step4.value;

                    if (segement.indexOf(chromeSegement.toLowerCase()) === 0) {
                        flag = true;
                        break;
                    }
                }
            } catch (err) {
                _didIteratorError4 = true;
                _iteratorError4 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                        _iterator4["return"]();
                    }
                } finally {
                    if (_didIteratorError4) {
                        throw _iteratorError4;
                    }
                }
            }

            if (!flag) {
                return false;
            }
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

    return true;
}

var supportMap = {
    IE: IE,
    Chrome: Chrome
};

function optimize(ua, family) {
    if (typeof supportMap[family] !== "function") {
        return false;
    }

    return supportMap[family](ua);
}

module.exports = optimize;