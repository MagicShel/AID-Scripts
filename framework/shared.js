const { context, frontMemory, authorsNote } = state;
const remember = memory;
const commandList = state.commandList = [];
const processorList = state.processorList = [];

class Entity {
    #id;
    #keys;
    #entry;
    #hidden;
    #dirty = false;
    constructor(e) {
        if (e instanceof Entity) {
            throw `Cannot create an entity from an entity`
        }
        if ('keys' in e && 'entry' in e) {
            if (e.keys && e.entry) {
                this.#id = 'id' in e ? e.id : undefined;
                this.#keys = e.keys;
                this.#entry = e.entry;
                this.#hidden = 'hidden' in e ? e.hidden : false;
                if (!this.#id) {
                    this.#dirty = true;
                }
            } else {
                throw `keys and entry are required`;
            }
        }
    }
    get id() {
        return this.#id;
    }
    get keys() {
        return this.#keys;
    }
    set keys(keys) {
        this.#keys = keys;
        this.#dirty = true;
    }
    get entry() {
        return this.#entry;
    }
    set entry(entry) {
        this.#entry = entry;
        this.#dirty = true;
    }
    get hidden() {
        return this.#hidden;
    }
    set hidden(hidden) {
        if (this.#hidden !== hidden) {
            this.#hidden = hidden;
            this.#dirty = true;
        }
    }
    log() {
        console.log(`id: ${this.#id ? this.#id : ""}`);
        console.log(`keys: ${this.#keys}`);
        console.log(`entry: ${this.#entry}`);
        console.log(`hidden: ${this.#hidden}`);
        console.log(`dirty: ${this.#dirty}`);
        console.log(`-----`)
    }
    isDirty() {
        return this.#dirty;
    }
    isNew() {
        return !this.#id;
    }
    save() {
        if (this.isDirty() && !this.isNew()) {
            updateWorldEntry(this.#id, this.#keys, this.#entry, this.#hidden);
            this.#dirty = false;
        } else if (this.isNew() && this.isDirty()) {
            addWorldEntry(this.#keys, this.#entry, this.#hidden);
            this.#dirty = false;
        }
    }
}

class Entities {
    #entities = [];
    constructor(worldInfo) {
        for (let e of worldInfo) {
            this.add(e);
        }
    }
    add(e) {
        let entity = e instanceof Entity ? e : new Entity(e);
        this.#entities.push(entity);
        return entity;
    }
    remove(e) {
        if (e instanceof Entity) {
            if (e.id) {
                removeWorldEntry(e.id);
            }
            let index = this.#entities.indexOf(e);
            if (index !== -1) {
                this.#entities.splice(index,1);
            }
        }
    }
    all() {
        return this.#entities;
    }
    filter(predicate) {
        return this.#entities.filter(predicate);
    }
    forEach(fn) {
        this.#entities.forEach(fn);
    }
    log(p) {
        if (p) {
            this.#entities.filter(p).forEach(e => e.log());
        } else {
            this.#entities.forEach(e => e.log());
        }
        console.log(`=====`)
    }
}
const entities = new Entities(worldEntries);
const stopProcessing = () => state.stop = true;
const isStop = () => state.stop;

const extractCommand = (text) => {
    const match = text.match(/(?:> You say, "\/|> You \/|\/)(\w+)(\W.*)?/i);
    const cmdName = (match && match[1]) ? match[1] : "";
    state.cmd = commandList.find(e => e["name"] == cmdName);
    if (state.cmd) {
        state.cmdArgs = match[2] ? match[2].trim() : "";
    }
}

const begin = () => {
    state.stop = false;
}

const complete = (text) => {
    entities.forEach(e => e.save());
    if (isStop()) {
        return {stop: true, text: ""};
    } else {
        return {text: text};
    }
}

const processInput = (text) => {
    let modifiedText = text;
    begin();
    extractCommand(modifiedText);
    if (state.cmd) {
        state.cmd.exec(state.cmdArgs);
    }
    return complete(modifiedText);
}

const processContext= (text) => {
    return text;
}

const processOutput = (text) => {
    return text;
}

const registerCommand = (cmdObject) => {
    if (cmdObject["name"]) {
        if (! commandList.find(e => e["name"] == cmdObject["name"])) {
            commandList.push(cmdObject);
        } else {
            throw `command already registered: ${cmdObject["name"]}`;
        }
    } else {
        throw `unable to register command\n${cmdObject}\ncause: no name`
    }
}

const registerProcessor = (procObject) => {
    if (procObject["input"] || procObject["context"] || procObject["output"]) {
        processorList.push(procObject);
    } else {
        throw `unable to register process without input, context, or output member`;
    }
}
 /*  End Framework    */
registerCommand({
    name: "test",
    exec: (arg) => {
        alert('test')
        entities.log();
        stopProcessing();
    },
});

registerCommand({
    name: "show",
    exec: (arg) => {
        args = arg.split(" ");
        let count = 0;
        if (!args) {
            entities.forEach(e => {
                e.hidden = false;
                count++;
            });
        } else {
            for (let a of args) {
                let regEx = new RegExp(a);
                let filtered = entities.filter(e => e.keys.match(regEx));
                for (let e of filtered) {
                    e.hidden = false;
                    count++;
                }
            }
        }
        console.log(count);
        entities.log(e => e.isDirty());
        stopProcessing();
    }
});

registerCommand({
    name: "hide",
    exec: (arg) => {
        args = arg.split(" ");
        let count = 0;
        if (!args) {
            entities.forEach( e => {
                e.hidden = true;
                count++;
            });
        } else {
            for (let a of args) {
                let regEx = new RegExp(a);
                let filtered = entities.filter(e => e.keys.match(regEx));
                for (let e of filtered) {
                    e.hidden = true;
                    count++;
                }
            }
        }
        entities.log(e => e.isDirty());
        stopProcessing();
    }
})

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
    roll: (args) => {
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
        return `${accumulator}`;
    }
};
/* End Dice Roller */

registerCommand({
    name: "roll",
    exec: (arg) => {
        args = arg.split(" ");
        console.log(dicePlugin.roll(args));
        stopProcessing();
    }
});

registerCommand({
    name: "clearwi",
    exec: (arg) => {
        entities.remove( e => true);
    }
});