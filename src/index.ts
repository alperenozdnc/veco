import fs from "fs";

import { Command } from "./interfaces";
import { help, create, Delete, view, focus, revert } from "./commands";
import { log } from "./utils";
import { LOCKFILE_PATH } from "./constants";

function main(args: string[]) {
    const commands: Command[] = [
        {
            callers: ["help", "-h", "--help"],
            action: () => help(commands),
            description: "Lists all the commands and their purposes.",
            lock: false,
        },
        {
            callers: ["create", "-C", "--create"],
            action: () => create(args.slice(1)),
            description: "Handles all create operations. Example: create project, create ignore, ...",
            lock: true,
        },
        {
            callers: ["delete", "-D", "--delete"],
            action: () => Delete(args.slice(1)),
            description: "Handles all delete operations. Example: delete project, delete ignore, ...",
            lock: true,
        },
        {
            callers: ["view", "-V", "--view"],
            action: () => view(args.slice(1)),
            description: "Handles all view operations. Example: view changes, view ignores, ...",
            lock: true,
        },
        {
            callers: ["focus", "-F", "--focus"],
            action: () => focus(args.slice(1)),
            description: "Puts focus on files to be added to a change. Example: focus file.txt, focus ./",
            lock: true,
        },
        {
            callers: ["revert", "-R", "--revert"],
            action: () => revert(args.slice(1)),
            description: "Reverts the filesystem back to a specific change. Example: revert [id]",
            lock: true,
        },
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
            if (fs.existsSync(LOCKFILE_PATH) && command.lock) {
                log.error("already running a veco command from somewhere else");
                log.warning("if you are sure no other commands are running, manually remove the LOCK file in your .veco folder");

                return;
            }

            if (command.lock) fs.writeFileSync(LOCKFILE_PATH, "");

            command.action();

            if (command.lock) fs.rmSync(LOCKFILE_PATH);

            return;
        }
    }

    // handle command not found
    log.error(`command '${userInput}' does not exist.`);
    console.log(`Type ${helpCommand.callers.map((caller: string) => `"${caller}"`).join(", ")} for help.`)
}

// file is not imported
if (require.main === module) {
    // first 2 args are node and the script being ran
    main(process.argv.slice(2));
}
