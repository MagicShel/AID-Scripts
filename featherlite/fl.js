const { encode, decode } = require('gpt-3-encoder');
const { readFile, writeFile } = require('fs');

const fl = {
	lterm: (s) => s.charAt(0).toLowerCase() + s.slice(1),
	uterm: (s) => s.charAt(0).toUpperCase() + s.slice(1),
	l_term: (s) => " " + fl.lterm(s),
	u_term: (s) => " " + fl.uterm(s),
	cmpStartTokens: (f,p) => { if ( f.length < p.length ) throw 'Terms out of order'; for ( let i=0; i<p.length; i++){ if (f[i].trim().toLowerCase() != p[i].trim().toLowerCase() ) return false; } return true; },
	tokenizeRegEx: /('[\w\s]+'|\w+|[^\w^\s]+?)/g,
	skipRegEx: /^['"].*['"]/g,
	upperRegEx: /^[A-Z]\w+/g,
	lowerRegEx: /^[a-z]\w+/g,
	symbolRegEx: /[\W]+/g,
	tokenizeInput: (s) => [...s.matchAll(fl.tokenizeRegEx)].map(m => m[0]),
	tokenize: (w) => encode(w).map( (e) => decode([e]) ),
	smash: (input) => {
		if (!input) throw 'Input missing'
		let phrase = "";
		phraseTokens = fl.tokenizeInput(input);
		for (let pToken of phraseTokens) {
			let term;
			if ( pToken.match( fl.skipRegEx ) ) { // Unbreakable token
				term = pToken;
			} else if ( pToken.match( fl.upperRegEx ) ) { // keep input capitals
				term = fl.tokenize(fl.u_term(pToken)).length < fl.tokenize(fl.uterm(pToken)).length ? fl.u_term(pToken) : pToken;
			} else if ( pToken.match( fl.lowerRegEx ) ) { // prefer lower case
				let term1 = fl.tokenize(fl.l_term(pToken)).length < fl.tokenize(fl.lterm(pToken)).length ? fl.l_term(pToken) : pToken;
				let term2 = fl.tokenize(fl.u_term(pToken)).length < fl.tokenize(fl.uterm(pToken)).length ? fl.u_term(pToken) : fl.uterm(pToken);
				term = fl.tokenize(term2).length < fl.tokenize(term1).length ? term2 : term1;
			} else if ( pToken.match( fl.symbolRegEx ) ) { // symbols
				term = fl.tokenize(" " + pToken).length < fl.tokenize(pToken).length ? " " + pToken : pToken;
			} else {
				term = pToken;
			}
			if (!phrase) {
				phrase = term;
			} else if ( term.match( fl.upperRegEx )  ) {
				phrase += fl.cmpStartTokens(fl.tokenize(phrase+term),fl.tokenize(phrase)) ? term : fl.l_term(term);
			} else if ( term.match( fl.lowerRegEx ) ) {
				if ( fl.cmpStartTokens(fl.tokenize(phrase+term),fl.tokenize(phrase)) ) {
					phrase += term;
				} else if ( fl.cmpStartTokens(fl.tokenize(phrase+fl.uterm(term)),fl.tokenize(phrase)) ) {
					phrase += fl. uterm(term);
				} else {
					phrase += fl.l_term(term);
				}
			} else {
				phrase += term;
			}
		}
		return phrase;
	}
}

// Testing functionality
const cmpTokens = (a,b) => { if ( a.length != b.length ) return false; for ( let i=0; i<a.length; i++ ){ if ( a[i].trim().toLowerCase() != b[i].trim().toLowerCase() ) return false; } return true; }
if ( fl.lterm("Hello") !== "hello" ) throw 'lterm fail';
if ( fl.uterm("hello") !== "Hello" ) throw 'uterm fail';
if ( fl.l_term("hello") !== " hello" ) throw 'l_term fail';
if ( fl.u_term("hello") !== " Hello" ) throw 'u_term fail';
if ( !cmpTokens(["1","2","3"],["1","2","3"]) ) throw 'cmpTokens fail matched';
if ( cmpTokens(["1","2","3"],["1","2","4"]) ) throw 'cmpTokens fail unmatched';
if ( !fl.cmpStartTokens(["1","2","3"],["1","2"]) ) throw 'cmpStartTokens fail matched';
if ( fl.cmpStartTokens(["1","2","3"],["1","3"]) ) throw 'cmpStartTokens fail unmatched';
if ( !cmpTokens ( fl.tokenizeInput("< 'do this' test >"),["<","'do this'","test",">"] ) ) throw 'tokenizeInput fail';
if ( !cmpTokens ( fl.tokenize('tokenize'),["token","ize"] ) ) throw 'tokenize fail';

// Execution
let input = process.argv.slice(2).join(' ');
let fileRegEx = /^(?:-f|--file)\s(.*)/;
let matches = input.match(fileRegEx);
if ( matches && matches[1]) { // Process file
	readFile(matches[1], 'utf8', (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		let countUpdated = 0;
		let countCharsOld = 0;
		let countCharsNew = 0;
		let countTokensOld = 0;
		let countTokensNew = 0;
		const worldEntries = JSON.parse(data);
		console.log(`worldEntries count: ${worldEntries.length}`)
		console.log(`worldEntries match: ${worldEntries.filter(e => !e.hidden).length}`);
		let foo = worldEntries.filter(e => !e.hidden).map(e => e.entry);
		worldEntries.filter(e => !e.hidden).forEach(e => {
			countCharsOld += e.entry.length;
			countTokensOld += fl.tokenize(e.entry).length;
			e.entry = fl.smash(e.entry); countUpdated++
			countCharsNew += e.entry.length;
			countTokensNew += fl.tokenize(e.entry).length;
		});
		let fileName = matches[1].split(".json")[0]+".fl.json";
		writeFile(fileName, JSON.stringify(worldEntries), 'utf8', (err) => {
			console.error(err);
			return;
		})
		console.log(`worldEntries updated: ${countUpdated}`);
		console.log(`characters old/new: ${countCharsOld}/${countCharsNew}`);
		console.log(`tokens old/new: ${countTokensOld}/${countTokensNew}`);
	});
} else { // Process input
	let output = fl.smash(input);
	let count = fl.tokenize(output).length;
	console.log(output);
	console.log(`Tokens: ${count}`);
}
