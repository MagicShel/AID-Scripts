Scripts here are designed to be copy/pasted at the bottom of the existing EWIJSON shared script.

They are intended to expand functionality without breaking existing functionality.

### roll-command.js
- Insert the dicePlugin constant at the bottom of shared.js
- Add the commented /roll command to state.commandList
- Combine dice and constants in any way you like. (spaces are important)
  - 1d6 + 2
  - 1d6 - 1d6
  - 1d6 + 1d4 + 1