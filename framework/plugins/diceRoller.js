/*
 * Utilities
 */
const isEven = (n) => n % 2 == 0;
/* End Utilities */

/*
 * Dice Roller Plugin
 */
const dicePlugin = {
    regEx: {
        term: /(?:([\d]*)(?:D([\d]+))|[\d]+)/gi, // Matches either XdY or N
        oper: /^[+|-]/gi // Matches '+' or '-'
    },
    throwDice: (qty, sides) => {
        let acc = 0;
        for (let i = 0; i < qty; i++) {
            acc += Math.floor(Math.random() * sides) + 1;
        }
        return acc;
    },
    inputModifier: (args) => {
        let accumulator = 0;
        let op = "+";
        for (let idx = 0; idx < args.length; idx++) {
            let arg = args[idx].trim();
            if (isEven(idx)) { // dice term
                let value = 0;
                const matches = [...arg.matchAll(dicePlugin.regEx.term)];
                let term = matches.map(m => m[0]);
                if (!term) throw `Unrecognized term '${arg}'`
                let qty = matches.map(m => m[1]);
                let sides = matches.map(m => m[2]);
                if (sides != "") { // roll
                    if ("" == qty) qty = "1";
                    value = dicePlugin.throwDice(parseInt(qty), parseInt(sides));
                } else { // constant
                    value = parseInt(term);
                }
                switch (op) {
                    case "+":
                        accumulator += value;
                        break;
                    case "-":
                        accumulator -= value;
                        break;
                    default:
                        throw `Unknown op: ${op}`;
                }
            } else { // operation
                let oper = arg.match(dicePlugin.regEx.oper);
                if (!oper) throw `Unrecognized op ' ${arg} '`;
                op = oper[0];
            }
        }
        appendMessage(accumulator); // This won't currently accomplish anything.
        return "";
    }
};
/* End Dice Roller */