"use strict";

var lru = require("lru-cache"),
    lruCache = new lru(1000);

var cache = {
    has: function has(ua) {
        return lruCache.has(ua);
    },
    get: function get(ua) {
        return lruCache.get(ua);
    },
    set: function set(ua, info) {
        lruCache.set(ua, info);
    }
};

module.exports = cache;