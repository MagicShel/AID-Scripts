const {decode} = require('gpt-3-encoder');
var args = process.argv.slice(2);
for (let arg of args) {
	console.log({arg, string: decode([arg])});
}