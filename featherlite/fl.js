const { encode, decode } = require('gpt-3-encoder');
const { readFile, writeFile } = require('fs');

const fl = {
	lterm: (s) => s.charAt(0).toLowerCase() + s.slice(1),
	uterm: (s) => s.charAt(0).toUpperCase() + s.slice(1),
	l_term: (s) => " " + fl.lterm(s),
	u_term: (s) => " " + fl.uterm(s),
	cmpStartTokens: (f,p) => { if ( f.length < p.length ) throw 'Terms out of order'; for ( let i=0; i<p.length; i++){ if (f[i].trim().toLowerCase() != p[i].trim().toLowerCase() ) return false; } return true; },
	fewestTokens: (a,b) => fl.tokenize(a).length <= fl.tokenize(b) ? a : b,
	tokenizeRegEx: /('[\w\s]+'|\w+|[^\w^\s]+?)/g,
	skipRegEx: /^['"].*['"]/g,
	upperRegEx: /^[A-Z]\w+/g,
	upper_RegEx: /^\s[A-Z]\w+/g,
	lowerRegEx: /^[a-z]\w+/g,
	lower_RegEx: /^\s[a-z]\w+/g,
	symbolRegEx: /[\W]+/g,
	termValue: (t) => {
		let term = t.join("");
		let pref = term.match(fl.lowerRegEx) ? 0 : term.match(fl.upperRegEx) ? 1 : term.match(fl.lower_RegEx) ? 2 : 3;
		let rank = Math.min(...t.map(e => e.trim().length));
		return pref - 100 * rank;
	},
	tokenizeInput: (s) => [...s.matchAll(fl.tokenizeRegEx)].map(m => m[0]),
	tokenize: (w) => encode(w).map( (e) => decode([e]) ),
	smash: (input) => {
		if (!input) throw 'Input missing'
		let phrase = "";
		phraseTokens = fl.tokenizeInput(input);
		for (let pToken of phraseTokens) {
			let term;
			if ( pToken.match( fl.skipRegEx ) ) { // Unbreakable token
				phrase += pToken;
			} else if ( pToken.match( fl.upperRegEx ) ) { // keep input capitals
				let options = [fl.tokenize(pToken),fl.tokenize(" " + pToken)]
					.sort((e,f) => fl.termValue(e) - fl.termValue(f))
					.filter(o => fl.cmpStartTokens(fl.tokenize(phrase+o.join("")),fl.tokenize(phrase)));
				phrase += options[0].join("");
			} else if ( pToken.match( fl.lowerRegEx ) ) { // prefer lower case
				let options = [fl.tokenize(pToken),fl.tokenize(fl.uterm(pToken)),fl.tokenize(" " + pToken),fl.tokenize(fl.u_term(pToken))]
					.sort((e,f) => fl.termValue(e) - fl.termValue(f))
					.filter(o => fl.cmpStartTokens(fl.tokenize(phrase+o.join("")),fl.tokenize(phrase)));
				phrase += options[0].join("");
			} else if ( pToken.match( fl.symbolRegEx ) ) { // symbols
				phrase += fl.tokenize(" " + pToken).length < fl.tokenize(pToken).length ? " " + pToken : pToken;
			} else {
				phrase += pToken;
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
let prefix = "???";
let suffix = "";
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
		worldEntries.filter(e => !e.hidden).forEach(e => {
			countCharsOld += e.entry.length;
			countTokensOld += fl.tokenize(e.entry).length;
			let _prefix = e.entry.startsWith(prefix) ? "" : prefix;
			let _suffix = e.entry.endsWith(suffix) ? "" : suffix;
			e.entry = fl.smash(_prefix + " " + e.entry + " " + _suffix);
			countUpdated++;
			e.hidden = true;
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
	let _prefix = e.entry.startsWith(prefix) ? "" : prefix;
	let _suffix = e.entry.endsWith(suffix) ? "" : suffix;
	let output = fl.smash(_prefix + " " + e.entry + " " + _suffix);
	let count = fl.tokenize(output).length;
	console.log(output);
	console.log(`Tokens: ${count}`);
}
