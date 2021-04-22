class PluginManager {
    #inputListeners;
    #contextListeners;
    #outputListeners;
    constructor() {
        this.#inputListeners = [];
        this.#contextListeners = [];
        this.#outputListeners = [];
    }

    registerInputListener(l) {
        if ('inputModifier' in l && ! this.#commandListeners.includes(l)) {
            this.#inputListeners.push(l);
        }
    }

    notifyInputListeners(text) {
        let result = {stop: false, text: text };
        for(let l of this.#commandListeners) {
            if (! result.stop) {
                _result = l.inputModifier(result.text);
                result.stop = 'stop' in _result ? result.stop | _result.stop : result.stop;
                result.text = 'text' in _result ? _result.text : result.text;
            }
        }
        return result;
    }

    registerContextListener(l) {
        if ('contextModifier' in l && ! this.#contextListeners.includes(l)) {
            this.#contextListeners.push(h);
        }
    }

    notifyContextListeners(text) {
        let result = {stop: false, text: text };
        for(let l of this.#contextListeners) {
            if (! result.stop) {
                _result = l.contextModifier(result.text);
                result.stop = 'stop' in _result ? result.stop | _result.stop : result.stop;
                result.text = 'text' in _result ? _result.text : result.text;
            }
        }
        return result;
    }
    registerOutputListener(l) {
        if ('outputModifier' in l && ! this.#outputListeners.includes(l)) {
            this.#outputListeners.push(h);
        }
    }

    notifyOutputListeners(text) {
        let result = {stop: false, text: text };
        for(let l of this.#outputListeners) {
            if (! result.stop) {
                _result = l.outputModifier(result.text);
                result.stop = 'stop' in _result ? result.stop | _result.stop : result.stop;
                result.text = 'text' in _result ? _result.text : result.text;
            }
        }
        return result;
    }
}

const pluginManager = new PluginManager();

(() => {
    SimpleContextPlugin.prototype._inputModifier = SimpleContextPlugin.prototype.inputModifier;
    SimpleContextPlugin.prototype._contextModifier = SimpleContextPlugin.prototype.contextModifier;
    SimpleContextPlugin.prototype._outputModifier = SimpleContextPlugin.prototype.outputModifier;

    SimpleContextPlugin.prototype.inputModifier = (text) => {
        let result = pluginManager.notifyInputListeners(text);
        if (! result.stop) {
            return simpleContextPlugin._inputModifier(result.text);
        } else {
            return result;
        }
    };
    SimpleContextPlugin.prototype.contextModifier = (text) => {
        let result = pluginManager.notifyContextListeners(text);
        if (! result.stop) {
            return simpleContextPlugin._contextModifier(result.text);
        } else {
            return result;
        }
    };
    SimpleContextPlugin.prototype.outputModifier = (text) => {
        let result = pluginManager.notifyOutputListeners(text);
        if (! result.stop) {
            return simpleContextPlugin._outputModifier(result.text);
        } else {
            return result;
        }
    };
    console.log("commandHandler augmented");
})();
