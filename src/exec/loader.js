//将不同格式的json规格化为程序能够接受的javascript对象. 标准格式的json不用做处理, 直接require即可.
/*
	支持的输入json格式可以有多种.
	但是输出的对象结构是一定的.
	[
		{
			name: 浏览器名,
			test: 测试ua的字符串, 字符串数组或正则,
			type: string | array | regexp,
			flag: string, //当type为regexp时, 表明正则使用的标记. 当type为string或array时, 表明指定在ua中的位置.
			hardtest: string | null //测试ua的正则, 仅当test为字符串或字符串数组时使用, 用于判断出ua的版本号,
			hardflag: string, //hardtest正则使用的标记,
			optimizer: 优化器的名字 | "null",
			children: [ //子测试对象 | "null"
				{}, //同样的对象结构.
				...
			]
		}
		...
	]
*/

'use strict'

function standardLoader(jsonPath){
	let jsonObj = require(jsonPath)
}		

//function otherLoader(jsonPath){}

exports.standardLoader = standardLoader