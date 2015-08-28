'use strict';

var UA = require("./ua.js"),

/*
	cache:
	{
		family: string,
		regex: RegExp object,
	}
*/
cacheArray = [],
    cacheMaxLength = 3,
    //设置为0时有个小bug.
hitCount = 0,
    missCount = 0,
    cacheCount = 0;

var match = function match(ua) {
	var counter = 0;
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = cacheArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var cache = _step.value;

			counter++;
			cacheCount++;
			var _result = cache.regex.exec(ua);
			if (!!_result) {
				hitCount++;
				redefine(cache);
				return {
					UA: new UA(cache.family, _result[1], _result[2], _result[3]),
					counter: counter
				};
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

	missCount++;
	return {
		UA: undefined,
		counter: counter
	};
};

var redefine = function redefine(cache) {
	FIFO(cache);
};

//LRU算法, 最近使用在最前. 替换时, 将最久没有使用的正则替换出去.
var LRU = function LRU(newCache) {
	for (var i = 0; i < cacheArray.length; i++) {
		var cache = cacheArray[i];
		if (cache.regex.source === newCache.regex.source) {
			LRU.timeArray[i]++;
			return;
		}
	}
	if (cacheArray.length < cacheMaxLength) {
		cacheArray.push(newCache);
		LRU.timeArray.push(1);
	} else {
		var pos = -1,
		    minTime = Infinity;
		for (var i = 0; i < LRU.timeArray.length; i++) {
			var time = LRU.timeArray[i];
			if (time < minTime) {
				minTime = time;
				pos = i;
			}
		}
		cacheArray.splice(pos, 1);
		LRU.timeArray.splice(pos, 1);
		cacheArray.push(newCache);
		LRU.timeArray.push(1);
	}
};
LRU.timeArray = [];

var LFU = function LFU(newCache) {
	for (var i = 0; i < cacheArray.length; i++) {
		var cache = cacheArray[i];
		if (cache.regex.source === newCache.regex.source) {
			cacheArray.splice(i, 1); //把元素提升到第一位.
			cacheArray.unshift(cache);
			return;
		}
	}
	if (cacheArray.length < cacheMaxLength) {
		cacheArray.unshift(newCache);
	} else {
		cacheArray.pop();
		cacheArray.unshift(newCache);
	}
};

var FIFO = function FIFO(newCache) {
	for (var i = 0; i < cacheArray.length; i++) {
		var cache = cacheArray[i];
		if (cache.regex.source === newCache.regex.source) {
			return;
		}
	}
	if (cacheArray.length < cacheMaxLength) {
		cacheArray.push(newCache);
	} else {
		cacheArray.pop();
		cacheArray.push(newCache);
	}
};

var load = function load(family, regex) {
	var cache = {
		family: family,
		regex: regex
	};
	redefine(cache);
};

var result = function result() {
	console.log("hit count : " + hitCount);
	console.log("miss count : " + missCount);
	console.log("cache count : " + cacheCount);
	console.log("-------------------------");
};

module.exports = {
	match: match,
	load: load,
	result: result
};