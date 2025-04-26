import fs from "fs";
import { select } from '@inquirer/prompts';

import { log, parseIgnores, readFocuses, printDiff } from "../../utils";
import { IGNOREFILE_PATH, REF_PATH, VECO_DIR } from "../../constants";
import { Action, File } from "../../interfaces";
import { handleCmd } from "../../functions";
import { compareTwoTrees } from "../create/compareTwoTrees";
import { createFileTree } from "../create/createFileTree";

interface Change {
    ID: string;
    msg: string;
    idx: number;
    desc?: string;
    MOD?: string;
    INIT?: string;
    DEL?: string;
}

type Scope = "all" | "focused-only" | "unfocused-only";

function isStrTypeScope(str: any): str is Scope {
    return ["all", "focused-only", "unfocused-only"].includes(str);
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

function viewDiff(arg: string) {
    if (!isStrTypeScope(arg)) return log.error("enter either all, focused-only, or unfocused-only");

    const REF_TREE = createFileTree(REF_PATH, true) as File[];
    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const differences = compareTwoTrees(REF_TREE, CURR_TREE);
    const ignores = parseIgnores();

    if (arg === "all") {
        for (const diff of differences!) {
            if (ignores.includes(diff.file.path)) {
                continue;
            }

            printDiff(diff);
        }

        return;
    }

    const refFocuses = readFocuses(REF_PATH);
    const focuses = readFocuses();

    for (const diff of differences!) {
        let path = diff.file.path;

        if (arg === "unfocused-only") {
            if (!refFocuses) {
                printDiff(diff);
                continue;
            }

            if (ignores.includes(path)) continue;

            path = path.replace(VECO_DIR, REF_PATH);

            if (refFocuses.includes(path)) continue;

            printDiff(diff);
            continue;
        }

        if (!refFocuses) {
            return log.error("no focusfile provided");
        }

        if (arg === "focused-only" && focuses!.includes(path) && !ignores.includes(path)) {
            printDiff(diff);
            continue;
        }
    }
}

export async function view(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "ignores", run: () => viewIgnores() },
        { name: "changes", run: () => viewChanges() },
        { name: "diff", run: () => viewDiff(restOfArgs[0]) },
    ]

    handleCmd(actions, cmd, "view");
}
