//parse one useragent. return version info and statistic info

"use strict";

var regexps = require("../static/standard-regexp.json"),
    cache = require("../lib/cache.js"),
    optimize = require("../lib/optimize.js"),
    userAgent = undefined,
    useCache = false;

var tester = {
    regexp: function regexp(ua, reg) {
        var result = new RegExp(reg).exec(ua);
        if (result === null) {
            return false;
        }
        tester.result = {
            major: result[1],
            minor: result[2],
            patch: result[3]
        };
        return true;
    },
    string: function string(ua, str) {
        return ua.indexOf(str) !== -1;
    }
};

function processResult(result) {
    !!useCache && cache.set(userAgent, result);
    return result;
}

function error() {
    var ERROR_RESULT = {
        family: "unknown",
        major: "unknown",
        minor: "unknown",
        patch: "unknown"
    };
    return processResult(ERROR_RESULT);
}

function parse(ua) {
    var uc = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    useCache = uc;
    userAgent = ua;

    if (!!useCache && cache.has(userAgent)) {
        return cache.get(userAgent);
    }

    var mainBrand = undefined;

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = regexps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var regexp = _step.value;
            var test = regexp.test;
            var testType = regexp.testType;
            var retest = regexp.retest;
            var retestType = regexp.retestType;

            if (!!tester[testType] && tester[testType](userAgent, test)) {
                if (!!retest) {
                    if (!!tester[retestType] && tester[retestType](userAgent, retest)) {
                        mainBrand = regexp;
                        break;
                    } else {
                        continue;
                    }
                } else {
                    mainBrand = regexp;
                    break;
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

    if (mainBrand === undefined) {
        return error();
    }

    if (!mainBrand.children || optimize(userAgent, mainBrand.family)) {
        return processResult({
            family: mainBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch
        });
    }

    var childBrand = undefined;

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
        for (var _iterator2 = mainBrand.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;
            var test = child.test;
            var testType = child.testType;
            var retest = child.retest;
            var retestType = child.retestType;

            if (!!tester[testType] && tester[testType](userAgent, test) && !!retest && !!tester[retestType] && tester[retestType](userAgent, retest)) {
                childBrand = child;
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

    if (childBrand === undefined) {
        return processResult({
            family: mainBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch
        });
    } else {
        return processResult({
            family: childBrand.family,
            major: tester.result.major,
            minor: tester.result.minor,
            patch: tester.result.patch
        });
    }
}

module.exports = parse;