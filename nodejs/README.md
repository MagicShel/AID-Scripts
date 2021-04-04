# Featherlite
Featherlite is a compressed form of caveman/futureman described by Rinter. It takes an existing WI without words mashed together and compresses them into the tightest possible format for optimum tokenization.
- Anything capitalized on the input will remain capitalized on the output, even if that isn't optimal (the assumption being it is a proper name).
- Anything in 'single quotes' will not be further compressed.
- Lowercase words will be converted to uppercase if it results in greater compression

Known issues:
- Maximum compression is a good start, but you may need to tweak things manually and add a little separation back in for best WI results.
- Brackets intended for encapsulation will be mashed together. So if you want to preserve the space between `> >`, you'll need to add it back in
- It does not currently attempt to minimize symbols. If you use emojis, they sometimes tokenize better with a space in front of them. This version does not attempt to address this, but it's on my to do list.

### Dependencies
- gpt-3-encoder