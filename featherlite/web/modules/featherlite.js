import { encoder, decoder} from './modules/Encoder.js';
import { sleep } from './modules/Util.js';

// function LoadJSON(filepath) {
//     //TEST FOR BROSWER
//     if (typeof window !== 'undefined' && typeof window.document !== 'undefined') {
//         return new Promise((resolve, reject) => {
//             let xhr = new XMLHttpRequest();
//             xhr.overrideMimeType("application/json");
//             xhr.onload = function () {
//                 if (xhr.readyState == 4 && xhr.status >= 200 && xhr.status < 300)
//                     resolve(JSON.parse(xhr.responseText));
//                 else
//                     reject(Error(xhr.statusText));
//             }

//             xhr.open("GET", filepath, true);
//             xhr.send();
//         });
//     }
//     return Promise.reject(Error("Unsupported platform!"));
// }

const featherlite = (function(e,d){
  'use strict';
	const lterm = (s) => s.charAt(0).toLowerCase() + s.slice(1);
	const uterm = (s) => s.charAt(0).toUpperCase() + s.slice(1);
	const l_term = (s) => " " + this.lterm(s);
	const u_term = (s) => " " + this.uterm(s);
	const cmpStartTokens = (f,p) => { if ( f.length < p.length ) throw 'Terms out of order'; for ( let i=0; i<p.length; i++){ if (f[i].trim().toLowerCase() != p[i].trim().toLowerCase() ) return false; } return true; };
	const fewestTokens = (a,b) => this.tokenize(a).length <= this.tokenize(b) ? a : b;
	const tokenizeRegEx = /('[\w\s]+'|\w+|[^\w^\s]+?)/g;
	const skipRegEx = /^['"].*['"]/g;
	const upperRegEx = /^[A-Z]\w+/g;
	const upper_RegEx = /^\s[A-Z]\w+/g;
	const lowerRegEx = /^[a-z]\w+/g;
	const lower_RegEx = /^\s[a-z]\w+/g;
	const symbolRegEx = /[\W]+/g;
	const termValue = (t) => {
		let term = t.join("");
		let pref = term.match(this.lowerRegEx) ? 0 : term.match(this.upperRegEx) ? 1 : term.match(this.lower_RegEx) ? 2 : 3;
		let rank = Math.min(...t.map(e => e.trim().length));
		return pref - 100 * rank;
	};
	const tokenizeInput = (s) => [...s.matchAll(fl.tokenizeRegEx)].map(m => m[0]);
	const tokenize = (w) => e(w).map( (e) => d([e]) );
	const smash = (input) => {
		if (!input) throw 'Input missing'
		let phrase = "";
		phraseTokens = this.tokenizeInput(input);
		for (let pToken of phraseTokens) {
			if ( pToken.match( this.skipRegEx ) ) { // Unbreakable token
				phrase += pToken;
			} else if ( pToken.match( this.upperRegEx ) ) { // keep input capitals
				let options = [this.tokenize(pToken),this.tokenize(" " + pToken)]
					.sort((e,f) => this.termValue(e) - this.termValue(f))
					.filter(o => this.cmpStartTokens(this.tokenize(phrase+o.join("")),this.tokenize(phrase)));
				phrase += options[0].join("");
			} else if ( pToken.match( this.lowerRegEx ) ) { // prefer lower case
				let options = [this.tokenize(pToken),this.tokenize(this.uterm(pToken)),this.tokenize(" " + pToken),this.tokenize(this.u_term(pToken))]
					.sort((e,f) => this.termValue(e) - this.termValue(f))
					.filter(o => this.cmpStartTokens(this.tokenize(phrase+o.join("")),this.tokenize(phrase)));
				phrase += options[0].join("");
			} else if ( pToken.match( this.symbolRegEx ) ) { // symbols
				phrase += this.tokenize(" " + pToken).length < this.tokenize(pToken).length ? " " + pToken : pToken;
			} else {
				phrase += pToken;
			}
		}
		return phrase;
	}
  return {
    smash: smash,
    tokenize: tokenize
  }
}(encoder, decoder));