/* Add /roll command */
const isEven = (n) => n % 2 == 0;
const throwDice = (qty, sides) => {
    let acc = 0;
    for (let i = 0; i < qty; i++) {
        acc += Math.floor(Math.random() * max) + 1;
    }
    return acc;
}
const diceExp = {
    term: /(?:([\d]*)(?:D([\d]+))|[\d]+)/gi, // Matches either XdY or N
    oper: /^[+|-]/gi // Matches '+' or '-'
}
if (!state.commandList) state.commandList = {};
if (state.commandList.roll) {
    state.message = "Unable to add roll command: already exists";
} else {
    state.commandList.roll = {
        name: 'roll',
        description: "Rolls dice",
        args: true,
        usage: 'Alternate between a dice term e.g. 1d6 or a constant e.g. 3 and a +/- operator, separated by spaces. Such as: 1d6 + 3 and 2d6 + 1d4. These terms are unlimited.',
        execute: (args) => {
            let accumulator = 0;
            let op = "+";
            for (let idx = 0; idx < args.length; idx++) {
                let arg = args[idx].trim();
                if (isEven(idx)) { // dice term
                    let value = 0;
                    const matches = [...arg.matchAll(diceExp.term)];
                    let term = matches.map(m => m[0]);
                    if (!term) throw `Unrecognized term '${arg}'`
                    let qty = matches.map(m => m[1]);
                    let sides = matches.map(m => m[2]);
                    if (sides != "") { // roll
                        if ("" == qty) qty = "1";
                        value = throwDice(parseInt(qty), parseInt(sides));
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
                    let oper = arg.match(diceExp.oper);
                    if (!oper) throw `Unrecognized op ' ${arg} '`;
                    op = oper[0];
                }
            }
            state.message = accumulator;
            return;
        }
    
    }
}
/* End /roll command */