import fs from "fs";

import { spawn } from "child_process";
import { select } from '@inquirer/prompts';

import { ORDERFILE_PATH, VECO_DIR } from "../../constants";
import { handleYesNoInput, isLastChange, log } from "../../utils";
import { readChangeFromId, revertToChange } from "../../functions";
import { Change } from "../../interfaces";

export async function viewChanges() {
    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to view");
        return;
    }

    const CHANGE_IDS = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");
    CHANGE_IDS.pop();

    let selected: Change | undefined;

    try {
        selected = await select({
            message: 'Select a change to view',
            choices: CHANGE_IDS.reverse().map((id: string) => {
                const change = readChangeFromId(id);

                return {
                    name: `[${id}]  "${change.msg}" (${new Date(+change.date).toLocaleString()})`,
                    value: change,
                    description: `${change.MOD.length} modified, ${change.INIT.length} initialized, ${change.DEL.length} deleted`
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
                disabled: isLastChange(selected!.ID) ? "(can't revert to latest change)" : false
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
                log.warning(`Reverting will undo ALL changes created after ${selected.ID} and ALL current unsaved changes`);
                handleYesNoInput(`Continue?`);
                console.log("");

                revertToChange(selected);

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
