const {encode, decode} = require('gpt-3-encoder');
var tokens = 0
var args = process.argv.slice(2);
for (let arg of args) {
	var aEncoded = encode(arg);
	var bEncoded = encode(" " + arg);
	for (let token of aEncoded) {
		console.log({token, string: decode([token])});
		tokens++;
	}
	for (let token of bEncoded) {
		console.log({token, string: decode([token])});
		tokens++;
	}
}
console.log('Tokens: ',tokens);