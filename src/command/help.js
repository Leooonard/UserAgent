//print help info

"use strict"

function processHelp(...params){
    console.log(
        "command list:\n",
        "file - analyze the ua log, return analyzed info. like uap file src result,\n",
        "   if result end with .md or .html, the file will be rendered\n",
        "one - analyze ua, return analyzed info. like uap one useragent string\n",
        "help - print help info. like uap help\n"
    )
}

module.exports = processHelp


// console.log('\
// command list:\n\
//     exec - analyze the ua log, return analyzed info. like ua exec [-cof] src [result]\n\
//         option c: use cache (default false)\n\
//         option o: use optimization for ie and chrome (default false)\n\
//         option f: src is a file (default string)\n\
//         result should the be a file path and end with .md or .html\n\
//     clean - filter the spiders in the ua log. like ua clean src target\n\
//     compare - compare two results. like ua compare src target [result]\n\
//         result should the be a file path and end with .md or .html\n\
//     help - print help')