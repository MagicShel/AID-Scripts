const {encode, decode} = require('gpt-3-encoder');
var tokens = 0
var args = process.argv.slice(2);
for (let arg of args) {
	var encoded = encode(arg);
	for (let token of encoded) {
		console.log({token, string: decode([token])});
		tokens++;
	}
}
console.log('Tokens: ',tokens);