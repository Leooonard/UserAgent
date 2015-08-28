'use strict';

var showdown = require("showdown"),
    converter = new showdown.Converter({
	tables: true
});

var md = function md() {
	var mdText = "";

	this.appendText = function (text) {
		mdText = mdText.concat("### ", text, "\n");
	};

	this.appendMultilineText = function (textArray) {
		var multilineText = "";
		var _iteratorNormalCompletion = true;
		var _didIteratorError = false;
		var _iteratorError = undefined;

		try {
			for (var _iterator = textArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
				var text = _step.value;

				multilineText = multilineText.concat(text, "<br>");
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

		mdText = mdText.concat(multilineText, "\n");
	};

	this.getMD = function () {
		return mdText;
	};

	this.appendTable = function (table) {
		mdText = mdText.concat(table, "\n");
	};

	this.createTable = function () {
		return new table();
	};

	this.toHTML = function () {
		return pretty(converter.makeHtml(mdText));
	};
};

var pretty = function pretty(htmlStr) {
	var style = "\
		<style>\
			table{\
				border-collapse: collapse;\
				border-spacing: 0;\
				line-height: 1.6;\
			}\
			tr:nth-child(even){\
				background-color: white;\
			}\
			tr:nth-child(odd){\
				background-color: rgb(248, 248, 248);\
			}\
			td{\
				border: solid 1px rgb(221, 221, 221);\
			}\
		</style>\
	";
	return htmlStr.concat(style);
};

var table = function table() {
	var _arguments = arguments;

	var mdText = "",
	    hasHead = false,
	    headCount = 0;

	this.getMD = function () {
		return mdText;
	};

	this.appendHead = function () {
		if (hasHead) {
			return;
		}
		var heads = [].slice.call(_arguments);
		headCount = heads.length;
		var _iteratorNormalCompletion2 = true;
		var _didIteratorError2 = false;
		var _iteratorError2 = undefined;

		try {
			for (var _iterator2 = heads[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
				var head = _step2.value;

				mdText = mdText.concat("|", head);
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

		mdText = mdText.concat("|\n");
		for (var i = 0; i < headCount; i++) {
			mdText = mdText.concat("|---");
		}
		mdText = mdText.concat("|\n");
		hasHead = true;
	};

	this.appendRow = function () {
		if (!hasHead) {
			return;
		}
		var cells = [].slice.call(_arguments);
		for (var i = 0; i < headCount; i++) {
			var cell = cells[i];
			if (cell !== undefined) {
				cell = cell.trim("\n");
				mdText = mdText.concat("|", cell);
			} else {
				mdText = mdText.concat("|", "");
			}
		}
		mdText = mdText.concat("|\n");
	};
};

module.exports = md;