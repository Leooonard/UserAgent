"use strict"

let lru = require("lru-cache")
,   lruCache = new lru(5000)

let cache = {
    has(ua){
        return lruCache.has(ua)
    },
    get(ua){
        return lruCache.get(ua)
    },
    set(ua, info){
        lruCache.set(ua, info)
    }
}

module.exports = cache