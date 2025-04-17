import { Command } from "./interfaces";
import { Help, Create } from "./commands";
import { LogError } from "./utils";

function main(args: string[]) {
    const commands: Command[] = [
        {
            callers: ["help", "-h", "--help"],
            action: () => Help(commands),
            description: "Lists all the commands and their purposes."
        },
        {
            callers: ["create", "-C", "--create"],
            action: () => Create(args.slice(1)),
            description: "Handles all create operations. Example: create project, create ignore, ..."
        }
    ];

    const helpCommand: Command = commands[0];
    const userInput: string = args[0];

    // automatically run help command if no args are provided
    if (!userInput) {
        helpCommand.action();
        return;
    }

    // handle command
    for (const command of commands) {
        if (command.callers.includes(userInput)) {
            command.action();
            return;
        }
    }

    // handle command not found
    LogError(`command '${userInput}' does not exist.`);
    console.log(`Type ${helpCommand.callers.map((caller: string) => `"${caller}"`).join(", ")} for help.`)
}

// file is not imported
if (require.main === module) {
    // first 2 args are node and the script being ran
    main(process.argv.slice(2));
}
