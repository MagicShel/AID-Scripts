import { smash, tokenize } from './modules/featherlite.js'

const entries = [
    {
      id:0.111111111111,
      keys:"foo",
      entry:"<<foo>>>>",
      hidden:false
    },
    {
      id:0.22222222222,
      keys:"bar",
      entry:"<<bar bar bar>>>>",
      hidden:false
    }
];
let countUpdated = 0;
let countCharsOld = 0;
let countCharsNew = 0;
let countTokensOld = 0;
let countTokensNew = 0;
console.log(`entries count: ${entries.length}`)
console.log(`entries match: ${entries.filter(e => !e.hidden).length}`);
entries.filter(e => !e.hidden).forEach(e => {
    countCharsOld += e.entry.length;
    countTokensOld += tokenize(e.entry).length;
    e.entry = smash(e.entry);
    countUpdated++
    countCharsNew += e.entry.length;
    countTokensNew += tokenize(e.entry).length;
});
console.log(`entries updated: ${countUpdated}`);
console.log(`characters old/new: ${countCharsOld}/${countCharsNew}`);
console.log(`tokens old/new: ${countTokensOld}/${countTokensNew}`);
console.log(JSON.stringify(entries));
  
