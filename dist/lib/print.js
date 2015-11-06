//print data.

"use strict";

var fs = require("fs");

function getPrinter(method, fd) {
    switch (method) {
        case "file":
            return function () {
                for (var _len = arguments.length, content = Array(_len), _key = 0; _key < _len; _key++) {
                    content[_key] = arguments[_key];
                }

                fs.writeSync(fd, content.join(" ") + "\n");
            };
        case "console":
            return console.log;
        default:
            return console.log;
    }
}

function printPrettyObject(obj) {
    var fd = arguments.length <= 1 || arguments[1] === undefined ? undefined : arguments[1];

    var method = undefined;
    if (!!fd) {
        method = "file";
    } else {
        method = "console";
    }
    var print = getPrinter(method, fd);
    print("{");

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = Object.keys(obj)[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var key = _step.value;

            print("   ", key, ":", obj[key]);
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

    print("}\n");
}

exports.printPrettyObject = printPrettyObject;