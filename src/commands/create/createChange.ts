import fs from "fs";
import sha from "sha1";

import { VECO_DIR, FOCUSFILE_PATH } from "../../constants";
import { File, Difference } from "../../interfaces";
import { log } from "../../utils";

import { createFileTree } from "./createFileTree";
import { compareTwoTrees } from "./compareTwoTrees";
import { getMsgAndDesc } from "./getMsgAndDesc";

export function createChange(args: string[]) {
    const DATE_UNIX_TIME: number = Date.now();
    const ID = sha(DATE_UNIX_TIME.toString()).substring(0, 10);
    let REF_TREE = createFileTree(`${VECO_DIR}/.veco/ref`, true) as File[];
    const { msg, desc, isDescProvided } = getMsgAndDesc(args);

    if (fs.existsSync(`${VECO_DIR}/.veco/order`)) {
        const order: string[] = fs.readFileSync(`${VECO_DIR}/.veco/order`).toString().split("\n");

        console.log({ order });

        // TODO: CompileLastChange
        // REF_TREE = CompileLastChange(order);
    }

    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const allDifferences = compareTwoTrees(REF_TREE, CURR_TREE);

    let focusesFileContent = fs.readFileSync(FOCUSFILE_PATH).toString().split("\n");
    let focuses = [];

    for (let i = 0; i < focusesFileContent.length; i++) {
        const path = focusesFileContent[i];

        if (!path) continue;
        if (!fs.existsSync(path)) continue;

        if (fs.statSync(path).isDirectory()) {
            focuses.push(...createFileTree(path, false, true));
            continue;
        }

        focuses.push(path);
    }

    const differences: Difference[] = [];

    for (const diff of allDifferences!) {
        const path = diff.file.path;

        if (focuses.includes(path) || diff.operation === "INIT") {
            differences.push(diff);
            continue;
        }
    }

    if (!differences) {
        log.error("nothing was changed");
        console.log("Aborting...");
        return;
    }

    if (!fs.existsSync(FOCUSFILE_PATH)) return log.error("no file is focused, nothing to change")

    fs.mkdirSync(`${VECO_DIR}/.veco/changes/${ID}`);
    fs.writeFileSync(`${VECO_DIR}/.veco/changes/${ID}/MOD`, "[]");
    fs.writeFileSync(`${VECO_DIR}/.veco/changes/${ID}/DEL`, "[]");
    fs.writeFileSync(`${VECO_DIR}/.veco/changes/${ID}/INIT`, "[]");

    for (const diff of differences) {
        const path = `${VECO_DIR}/.veco/changes/${ID}/${diff.operation}`;
        const newFileData: Difference[] = JSON.parse(fs.readFileSync(path).toString());

        newFileData.push(diff);

        fs.writeFileSync(path, JSON.stringify(newFileData));
    }

    fs.writeFileSync(`${VECO_DIR}/.veco/messages/${ID}`, `${msg}\n`);
    if (isDescProvided) fs.writeFileSync(`${VECO_DIR}/.veco/messages/${ID}`, `\n${desc}`);

    fs.writeFileSync(`${VECO_DIR}/.veco/dates/${ID}`, DATE_UNIX_TIME.toString());
    fs.appendFileSync(`${VECO_DIR}/.veco/order`, `${ID}\n`);
}
