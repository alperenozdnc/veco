import fs from "fs";
import sha from "sha1";

import { VECO_DIR, FOCUSFILE_PATH, REF_PATH } from "../../constants";
import { File, Difference } from "../../interfaces";
import { log } from "../../utils";

import { createFileTree } from "./createFileTree";
import { compareTwoTrees } from "./compareTwoTrees";
import { getMsgAndDesc } from "./getMsgAndDesc";
import { updateRefTree } from "./updateRefTree";

export function createChange(args: string[], dev = false) {
    const DATE_UNIX_TIME: number = Date.now();
    const ID = sha(DATE_UNIX_TIME.toString()).substring(0, 10);
    let REF_TREE = createFileTree(REF_PATH, true) as File[];
    const { msg, desc, isDescProvided } = getMsgAndDesc(args);

    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const allDifferences = compareTwoTrees(REF_TREE, CURR_TREE);

    let focusesFileContent = fs.readFileSync(FOCUSFILE_PATH).toString().split("\n");
    let focuses = [];

    for (let i = 0; i < focusesFileContent.length; i++) {
        const path = focusesFileContent[i];

        if (!path) continue;

        if (fs.existsSync(path) && fs.statSync(path).isDirectory()) {
            focuses.push(...createFileTree(path, false, true));
            continue;
        }

        focuses.push(path);
    }

    const differences: Difference[] = [];

    for (const diff of allDifferences!) {
        const path = diff.file.path;

        if (focuses.includes(path)) {
            differences.push(diff);
            continue;
        }
    }

    if (differences.length === 0) {
        log.error("nothing was changed");
        console.log("Aborting...");
        return;
    }

    if (!fs.existsSync(FOCUSFILE_PATH)) return log.error("no file is focused, nothing to change")

    if (dev) {
        log.warning("dev mode enabled, no creating or destroying files");
        console.log("CHANGE CREATED", { DATE_UNIX_TIME, ID, msg, desc, diff: differences });
        updateRefTree(REF_PATH, differences);

        return;
    }

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

    updateRefTree(REF_PATH, differences);

    fs.rmSync(FOCUSFILE_PATH);

    console.log(`change created successfully [${ID}]`);
    console.log(`${msg}`);

    if (isDescProvided) {
        console.log(`${desc}`);
    }
}
