import fs from "fs";

import { spawn } from "child_process";
import { select } from '@inquirer/prompts';

import { VECO_DIR } from "../../constants";
import { log } from "../../utils";

interface Change {
    ID: string;
    msg: string;
    idx: number;
    desc?: string;
    MOD?: string;
    INIT?: string;
    DEL?: string;
}

export async function viewChanges() {
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
                name: `See MOD operations (${selected?.MOD?.length} existing)`,
                value: "mod",
                description: "",
                disabled: selected?.MOD?.length === 0 ? "(nothing to see)" : false
            },
            {
                name: `See INIT operations (${selected?.INIT?.length} existing)`,
                value: "init",
                description: "",
                disabled: selected?.INIT?.length === 0 ? "(nothing to see)" : false
            },
            {
                name: `See DEL operations (${selected?.DEL?.length} existing)`,
                value: "del",
                description: "",
                disabled: selected?.DEL?.length === 0 ? "(nothing to see)" : false
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
                spawn("nvim", [`${VECO_DIR}/.veco/changes/${selected.ID}/DEL`], {
                    stdio: 'inherit',
                    detached: true
                });


                break;
            case "init":
                spawn("nvim", [`${VECO_DIR}/.veco/changes/${selected.ID}/INIT`], {
                    stdio: 'inherit',
                    detached: true
                });

                break;
            case "mod":
                spawn("nvim", [`${VECO_DIR}/.veco/changes/${selected.ID}/MOD`], {
                    stdio: 'inherit',
                    detached: true
                });

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
