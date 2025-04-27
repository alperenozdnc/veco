import fs from "fs";

import { spawn } from "child_process";
import { select } from '@inquirer/prompts';

import { ORDERFILE_PATH } from "../../constants";
import { handleYesNoInput, isLastChange, log } from "../../utils";
import { readChangeFromId, revertToChange } from "../../functions";
import { Change } from "../../interfaces";

export async function viewChanges() {
    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to view");
        return;
    }

    const CHANGE_IDS = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");
    const TMP_DIFF_PATH = "/tmp/VIEW";

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
                fs.writeFileSync(TMP_DIFF_PATH, "");

                for (const DELAction of selected.DEL) {
                    fs.appendFileSync(TMP_DIFF_PATH, ` ${"-".repeat(15)} DELETE PATH ${DELAction.file.path} ${"-".repeat(15)}\n`);
                    fs.appendFileSync(TMP_DIFF_PATH, `${DELAction.file.content}`);
                }

                spawn("nvim", [TMP_DIFF_PATH], {
                    stdio: 'inherit',
                    detached: true
                });

                break;
            case "init":
                fs.writeFileSync(TMP_DIFF_PATH, "");

                for (const INITAction of selected.INIT) {
                    fs.appendFileSync(TMP_DIFF_PATH, ` ${"-".repeat(15)} INITIALIZE PATH ${INITAction.file.path} ${"-".repeat(15)}\n`);
                    fs.appendFileSync(TMP_DIFF_PATH, `${INITAction.file.content}`);
                }

                spawn("nvim", [TMP_DIFF_PATH], {
                    stdio: 'inherit',
                    detached: true
                });

                break;
            case "mod":
                fs.writeFileSync(TMP_DIFF_PATH, "");

                for (const MODAction of selected.MOD) {
                    fs.appendFileSync(TMP_DIFF_PATH, ` ${"-".repeat(15)} MODIFY ${MODAction.file.path} ${"-".repeat(15)}\n`);
                    fs.appendFileSync(TMP_DIFF_PATH, ` ${"-".repeat(7)} OLD FILE ${"-".repeat(10)}\n`);
                    fs.appendFileSync(TMP_DIFF_PATH, `${MODAction.file.content}`);
                    fs.appendFileSync(TMP_DIFF_PATH, ` ${"-".repeat(7)} NEW FILE ${"-".repeat(10)}\n`);
                    fs.appendFileSync(TMP_DIFF_PATH, `${MODAction.newFile?.content ?? "[CONTENT NOT FOUND]"}\n`);
                }

                spawn("nvim", [TMP_DIFF_PATH], {
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
