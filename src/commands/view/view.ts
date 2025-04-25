import fs from "fs";
import { select } from '@inquirer/prompts';

import { checkVecoDir, log } from "../../utils";
import { IGNOREFILE_PATH, VECO_DIR } from "../../constants";
import { Action } from "../../interfaces";
import { handleCmd } from "../../functions";

interface Change {
    ID: string;
    msg: string;
    idx: number;
    desc?: string;
    MOD?: string;
    INIT?: string;
    DEL?: string;
}

function viewIgnores() {
    if (!fs.existsSync(IGNOREFILE_PATH)) return log.error("no ignore file, create .vecoig file to see ignores");

    const IGNORES = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");
    IGNORES.pop();

    console.log(`ignores (${IGNORES.length} total): `);

    for (const ignore of IGNORES) {
        console.log(`  ${ignore}`);
    }
}

async function viewChanges() {
    const ORDERFILE_PATH = `${VECO_DIR}/.veco/order`;

    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to view");
        return;
    }

    const CHANGE_IDS = fs.readFileSync(`${VECO_DIR}/.veco/order`).toString().split("\n");
    CHANGE_IDS.pop();

    let selected: Change | undefined;

    try {
        selected = await select({
            message: 'Select a change to view',
            choices: CHANGE_IDS.reverse().map((id: string, idx: number) => {
                const msgAndDesc = fs.readFileSync(`${VECO_DIR}/.veco/messages/${id}`).toString().split("\n");
                const msg = msgAndDesc[0];

                const changeDate = new Date(+fs.readFileSync(`${VECO_DIR}/.veco/dates/${id}`)).toLocaleString();
                let mod = JSON.parse(fs.readFileSync(`${VECO_DIR}/.veco/changes/${id}/MOD`).toString());
                let init = JSON.parse(fs.readFileSync(`${VECO_DIR}/.veco/changes/${id}/INIT`).toString());
                let del = JSON.parse(fs.readFileSync(`${VECO_DIR}/.veco/changes/${id}/DEL`).toString());

                return {
                    name: `[${id}]  "${msg}" (${changeDate})`,
                    value: { ID: id, msg: msg, desc: msgAndDesc[1] ?? null, INIT: init, DEL: del, MOD: mod, idx: idx },
                    description: `${mod.length} modified, ${init.length} initialized, ${del.length} deleted`
                };
            }),
        });
    } catch (error) {
        if ((error as Error).name === "ExitPromptError") {
            return console.log("Aborting...");
        }
    }

    console.clear();

    let option = "";

    try {
        let choices = [
            {
                name: "See MOD operations",
                value: "mod",
                description: ""
            },
            {
                name: "See INIT operations",
                value: "init",
                description: ""
            },
            {
                name: "See DEL operations",
                value: "del",
                description: ""
            },
            {
                name: "Revert to change",
                value: "revert",
                description: "",
                disabled: selected!.idx === 0 ? "(can't revert to latest change)" : false
            },
            {
                name: "Cancel",
                value: "cancel",
                description: "",
            },
        ]

        option = await select({
            message: `Select an option:`,
            choices: choices
        });

        // so that ts shuts up
        if (!selected) return;

        switch (option) {
            case "del":
                console.log(selected.DEL);

                break;
            case "init":
                console.log(selected.INIT);

                break;
            case "mod":
                console.log(selected.MOD);

                break;
            case "revert":
                console.log(`Reverting to ${selected.ID}...`)

                break;
            case "cancel":
                process.exit();
        }
    } catch (error) {
        if ((error as Error).name === "ExitPromptError") {
            return console.log("Aborting...");
        }
    }
}

export async function view(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "ignores", run: () => viewIgnores() },
        { name: "changes", run: () => viewChanges() },
    ]

    handleCmd(actions, cmd, "view");

}
