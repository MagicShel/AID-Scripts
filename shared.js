/*
 * Framework
 */
const commandRegEx = /^(?:\/|> You \/|> You say "\/)(.*)/gi;

const plugins = [];
const commands = []
const registerPlugin = (plugin) => plugins.push(plugin);
const registerCommand = (cmd, p) => commands.push( {command: cmd, plugin: p} );

const runInputCommand = (text) => {
    let result = commandRegEx.exec(text);
    if (result && result[0]) {
        let args = result[0].replace(/"\n$|.\n$/, '').split(/ +/);
        let command = args.shift().replace(/\W*/gi, '');
        let c = commands.find(cmd => cmd.command == command);
        if (c) return c.plugin.inputModifier(args);
    }
    return text;
}

const processInput = (text) => {
    let modifiedText = text;
    state.message = "";
    modifiedText = runInputCommand(text);
    for (let plugin of plugins) {
        if(modifiedText) { modifiedText = plugin.inputModifier ? plugin.inputModifier(modifiedText) : modifiedText; }
    }
    if (modifiedText) {
        return { text: modifiedText };
    } else {
        return { stop: true };
    }
}

const processContext = (text) => {
    let modifiedText = text;
    state.message = "";
    if (plugins) {
        for (let plugin of plugins) {
            if(modifiedText) { modifiedText = plugin.contextModifier ? plugin.contextModifier(modifiedText) : modifiedText; }
        }
    }
    if (modifiedText) {
        return { text: modifiedText };
    } else {
        return { stop: true };
    }
}
const processOutput = (text) => {
    let modifiedText = text;
    state.message = "";
    if (plugins) {
        for (let plugin of plugins) {
            if (modifiedText) {
                modifiedText = plugin.contextModifier ? plugin.outputModifier(modifiedText) : modifiedText;
            }
        }
    }
    if (modifiedText) {
        return { text: modifiedText };
    } else {
        return { stop: true };
    }

}
const beginInput = () => {
    state.continue = true;
    state.message = "";
}
const submitInput = (submitText) => {
    if (!submitText || state.continue == false) {
        return { stop: true };
    }
    return { text: submitText };
}
const submitPrevent = () => state.continue = false;
const appendMessage = (text) => {
    if (state.message && state.message.length > 0) {
        state.message = `${state.message}\n${text}`;
    } else {
        state.message = "" + text;
    }
}

/* End Framework */

/* Paste Plugins Here */

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

/* End Plugins */

/* Register commands in process order */
registerCommand("roll",dicePlugin);

/* Register plugins in process order */