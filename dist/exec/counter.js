'use strict';

var registed = {};

var register = function register(name) {
	if (registed[name] !== undefined) {
		registed[name] = 0;
	}
};

var record = function record(name) {
	if (registed[name] !== undefined) {
		registed[name] += 1;
	}
};

var result = function result(name) {
	return registed[name];
};

var destory = function destory(name) {
	if (registed[name] !== undefined) {
		registed[name] = undefined;
	}
};

exports.register = register;
exports.record = record;
exports.result = result;
exports.destory = destory;