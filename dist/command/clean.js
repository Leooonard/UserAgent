//clean useragent log. remove spiders.

"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var fs = require("fs");

function processClean(_ref) {
    var _ref2 = _slicedToArray(_ref, 2);

    var srcPath = _ref2[0];
    var destPath = _ref2[1];

    if (typeof srcPath !== "string") {
        throw new Error("file command need two params, src file path and dest file path");
    }
    if (!fs.existsSync(srcPath)) {
        throw new Error("src file is not exist.");
    }
}

module.exports = processClean;