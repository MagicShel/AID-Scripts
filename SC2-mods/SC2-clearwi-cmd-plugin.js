(() => {
    SimpleContextPlugin.prototype.commandHandlerPreClearwi = SimpleContextPlugin.prototype.commandHandler;
    SimpleContextPlugin.prototype.commandHandler = function(text) {
        // do something additional
        let match = SC_RE.INPUT_CMD.exec(text)
        if (match) match = match.filter(v => !!v)
        if (!match || match.length < 2) return text
    
        // Check if the command was valid
        const cmd = match[1].toLowerCase()
        if (cmd === "clearwi") {
            console.log("Clearing world entries")
            worldEntries.filter(e => e.id).forEach(e => removeWorldEntry(e.id));
            return "";            
        } else {
            console.log("Invoking original handler")
            return simpleContextPlugin.commandHandlerPreClearwi(text);
        }
    };
    console.log("commandHandler augmented");
})();