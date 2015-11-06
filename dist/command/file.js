//parse useragent file.

"use strict";

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var RESULT_LOG = "result.log";

var fs = require("fs"),
    path = require("path"),
    linebylineReader = require("line-by-line"),
    parse = require("../lib/parser.js"),
    printer = require("../lib/print.js"),
    isDirectory = require("../lib/tool.js").isDirectory;

function parseConfigFile(configPath, callback) {
    configPath = configPath.indexOf("./") === 0 ? configPath : "./" + configPath;

    var lineReader = new linebylineReader(configPath),
        json = "";
    lineReader.on("err", function (err) {
        callback(err);
    });
    lineReader.on("line", function (line) {
        json += line;
    });
    lineReader.on("end", function () {
        var config = undefined;
        try {
            config = JSON.parse(json);
        } catch (err) {
            callback(err);
        }

        var _config = config;
        var _config$file = _config.file;
        var file = _config$file === undefined ? undefined : _config$file;
        var _config$output = _config.output;
        var output = _config$output === undefined ? undefined : _config$output;
        var _config$analysis = _config.analysis;
        var analysis = _config$analysis === undefined ? false : _config$analysis;
        var _config$count = _config.count;
        var count = _config$count === undefined ? 0 : _config$count;

        if (typeof file !== "string") {
            callback(new Error("file attribute must be string."));
        }
        if (typeof output !== "string") {
            output = undefined;
        }

        callback(undefined, {
            file: file,
            output: output,
            analysis: analysis,
            count: count
        });
    });
}

function _process(config) {

    var lineReader = new linebylineReader(config.file),
        resultList = [];

    lineReader.on("err", function (err) {
        throw new Error(err);
    });
    lineReader.on("line", function (line) {
        var result = parse(line, true);
        result.useragent = line;
        resultList.push(result);
    });
    lineReader.on("end", function () {
        var fd = undefined;
        if (config.output === undefined) {
            fd = undefined;
        } else {
            fd = fs.openSync(path.join(config.output, RESULT_LOG), "w+");
        }
        resultList.forEach(function (result) {
            printer.printPrettyObject(result, fd);
        });
        if (!!config.analysis) {}

        console.log("========== all finish ==========");
    });
}

function processFile(_ref) {
    var _ref2 = _slicedToArray(_ref, 1);

    var configPath = _ref2[0];

    if (typeof configPath !== "string") {
        configPath = "./uap.config.json";
    }

    parseConfigFile(configPath, function (err, config) {
        if (!!err) {
            throw new Error(err);
        }
        _process(config);
    });
}

module.exports = processFile;