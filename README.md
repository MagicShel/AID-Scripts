# AID-Scripts

## Scripts for AI Dungeon
Currently the core scripts are just the framework with a non-working (in the sense that the result isn't displayed - it's a work in progress) dice roller.

## EWIJSON-mods
Mods designed to be added to EWIJSON

## Framework
My efforts at building a modular framework that easily allows for a combination of plugins. It is not feature-complete and has only been designed with my dice roller mod in mind, so this should be considered a Proof of Concept rather than something for general use.

## NodeJS
Helper scripts I've written to run using a local Node installation.

## Featherlite
Featherlite is a compressed form of caveman/futureman. This takes an existing WI without words mashed together and compresses them into the tightest possible format for optimum tokenization.
- Anything capitalized on the input will remain capitalized on the output, even if that isn't optimal (the assumption being it is a proper name).
- Anything in 'single quotes' will not be further compressed.
- Lowercase words will be converted to uppercase if it results in greater compression