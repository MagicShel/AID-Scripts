# Featherlite

## Summary
Featherlite is a compressed form of caveman/futureman described by Rinter. It takes an existing WI without words mashed together and compresses them into the tightest possible format for optimum tokenization.
- Anything capitalized on the input will remain capitalized on the output, even if that isn't optimal (the assumption being it is a proper name).
- Anything in 'single quotes' will not be further compressed.
- Lowercase words will be converted to uppercase if it results in greater compression

### Usage
`node fl "< Stuff you want to minimize >"

## Known Issues
- Maximum compression is a good start, but you may need to tweak things manually and add a little separation back in for best WI results.
- If you already have words mashed together, this will not unmash them, which _could_ result in non-optimal minimizing. I highly recommend unmashing any existing WI and starting from scratch.
- Brackets intended for encapsulation will be mashed together. So if you want to preserve the space between `> >`, you'll need to add it back in

### Dependencies
- gpt-3-encoder