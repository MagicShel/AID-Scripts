const {encode, decode} = require('gpt-3-encoder');
const lterm = (s) => s.charAt(0).toLowerCase() + s.slice(1);
const uterm = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const l_term = (s) => " " + lterm(s);
const u_term = (s) => " " + uterm(s);
const cmpTokens = (a,b) => { if ( a.length != b.length ) return false; for ( let i=0; i<a.length; i++ ){ if ( a[i].trim().toLowerCase() != b[i].trim().toLowerCase() ) return false; } return true; }
const cmpTokensStart = (f,p) => { if ( f.length < p.length ) throw 'Terms out of order'; for ( let i=0; i<p.length; i++){ if (f[i].trim().toLowerCase() != p[i].trim().toLowerCase() ) return false; } return true; }
const tokenizeRegEx = /('[\w\s]+'|\w+|[^\w^\s]+?)/g;
const tokenizePhrase = (s) => {
	const matches = [...s.matchAll(tokenizeRegEx)];
	let idx = 0;
	return matches.map(m => m[idx]);
}
const tokenizeWord = (w) => encode(w).map( (e) => decode([e]) );

// Testing functionality
if ( lterm("Hello") !== "hello" ) throw 'lterm fail';
if ( uterm("hello") !== "Hello" ) throw 'uterm fail';
if ( l_term("hello") !== " hello" ) throw 'l_term fail';
if ( u_term("hello") !== " Hello" ) throw 'u_term fail';
if ( !cmpTokens(["1","2","3"],["1","2","3"]) ) throw 'cmpTokens fail matched';
if ( cmpTokens(["1","2","3"],["1","2","4"]) ) throw 'cmpTokens fail unmatched';
if ( !cmpTokensStart(["1","2","3"],["1","2"]) ) throw 'cmpTokensStart fail matched';
if ( cmpTokensStart(["1","2","3"],["1","3"]) ) throw 'cmpTokensStart fail unmatched';
if ( !cmpTokens ( tokenizePhrase("< 'do this' test >"),["<","'do this'","test",">"] ) ) throw 'tokenizePhrase fail';
if ( !cmpTokens ( tokenizeWord('tokenize'),["token","ize"] ) ) throw 'tokenizeWord fail';

let input = process.argv.slice(2).join(' ');
let phrase = "";
if (input) {
	phraseTokens = tokenizePhrase(input);
	for (let pToken of phraseTokens) {
		let term;
		if ( pToken.match( /^'.*'/g ) ) { // Unbreakable token
			term = pToken;
		} else if ( pToken.match( /^[A-Z]\w+/g ) ) { // Keep upper
			term = tokenizeWord(u_term(pToken)).length < tokenizeWord(uterm(pToken)).length ? u_term(pToken) : pToken;
		} else if ( pToken.match( /^[a-z]\w+/g ) ) { // prefer lower
			let term1 = tokenizeWord(l_term(pToken)).length < tokenizeWord(lterm(pToken)).length ? l_term(pToken) : pToken;
			let term2 = tokenizeWord(u_term(pToken)).length < tokenizeWord(uterm(pToken)).length ? u_term(pToken) : uterm(pToken);
			term = tokenizeWord(term2).length < tokenizeWord(term1).length ? term2 : term1;
		} else if ( pToken.match( /^≡/g ) ) {
			term = ' ≡';
		} else {
			term = pToken;
		}
		if (!phrase) {
			phrase = term;
		} else if ( term.match( /^[A-Z]/g )  ) { // upper
			phrase += cmpTokensStart(tokenizeWord(phrase+term),tokenizeWord(phrase)) ? term : l_term(term);
		} else if ( term.match( /^[a-z]/g ) ) { // lower
			if ( cmpTokensStart(tokenizeWord(phrase+term),tokenizeWord(phrase)) ) {
				phrase += term;
			} else if ( cmpTokensStart(tokenizeWord(phrase+uterm(term)),tokenizeWord(phrase)) ) {
				phrase += uterm(term);
			} else {
				phrase += l_term(term);
			}
		} else {
			phrase += term;
		}
	}
}
console.log(phrase);
