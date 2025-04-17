"use strict";
function main(args) {
    const commands = [
        {
            callers: ["help", "-h", "--help"],
            action: () => console.log("help command")
        }
    ];
    const helpCommand = commands[0];
    const userInput = args[0];
    // automatically run help command if no args are provided
    if (!userInput) {
        helpCommand.action();
        return;
    }
    // handle command
    for (let command of commands) {
        if (command.callers.includes(userInput)) {
            command.action();
            return;
        }
    }
    // handle command not found
    console.log(`The command '${userInput}' does not exist.`);
    console.log(`Type ${helpCommand.callers.map((caller) => `"${caller}"`).join(", ")} for help.`);
}
// file is not imported
if (require.main === module) {
    // first 2 args are node and the script being ran
    main(process.argv.slice(2));
}
