# Featherlite
See: https://github.com/RinterWaptor/AID-research/wiki/Featherlite

## Summary
Featherlite is a compressed form of caveman/futureman described by Rinter. It takes an existing WI without words mashed together and compresses them into the tightest possible format for optimum tokenization.
- Anything capitalized on the input will remain capitalized on the output, even if that isn't optimal (the assumption being it is a proper name).
- Anything in 'single quotes' or "double quotes" will not be further compressed.
- Lowercase words will be converted to uppercase if it results in greater compression

### Usage
**This is a NodeJS script. You must have Node installed locally and run it from a command prompt.**
**Before use, run `npm install gpt-3-encoder` in the folder with fl.js**
- `node fl "< Stuff you want to minimize >"`
- `node fl --file <path to file>`

### Output
- This script will generate a new file and leave your old one untouched.
- The new file will end in .fl.json and all entries will be copied over.
- Only non-hidden entries will be minified. Hidden entries will be copied over verbatim.
- All entities in the new file will be hidden (because I prefer it this way, if someone doesn't like it, maybe I'll add a switch for this)

## Known Issues
- Maximum compression is a good start, but you may need to tweak things manually and add a little separation back in for best WI results.
- If you already have words mashed together, this will not unmash them, which _could_ result in non-optimal minimizing. I highly recommend unmashing any existing WI and starting from scratch.
- Brackets intended for encapsulation will be mashed together. So if you want to preserve the space between `> >`, you'll need to add it back in
- I ran into an issue passing in an argument containing an exclamation mark. I resolved it by wrapping the argument in 'single quotes'. This might be a Linux-only thing.

### Dependencies
- gpt-3-encoder