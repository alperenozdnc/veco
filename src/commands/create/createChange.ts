import fs from "fs";
import sha from "sha1";

import { VECO_DIR, FOCUSFILE_PATH } from "../../constants";
import { File, Difference } from "../../interfaces";
import { log } from "../../utils";

import { createFileTree } from "./createFileTree";
import { compareTwoTrees } from "./compareTwoTrees";
import { logUsage } from "./logUsage";

export function createChange(args: string[]) {
    const DATE_UNIX_TIME: number = Date.now();
    const ID = sha(DATE_UNIX_TIME.toString()).substring(0, 10);

    const CHANGE_OPTS = {
        message: { names: ["-M", "msg", "--message"], label: "msg" },
        description: { names: ["-D", "desc", "--description"], label: "desc" }
    };

    if (args.length < 2) {
        log.error("insufficient arguments");
        logUsage();
        return;
    }

    const hasMsgOption = args.some((arg: string) => CHANGE_OPTS.message.names.includes(arg));

    if (!hasMsgOption) {
        log.error("message option is mandatory.")
        logUsage();
        return;
    }

    let currOption: "msg" | "desc" | undefined;

    let isDescProvided = false;

    let msg: string = "";
    let desc: string | undefined;

    for (const arg of args) {
        const options = [...CHANGE_OPTS.message.names, ...CHANGE_OPTS.description.names];
        const isArgOption = options.includes(arg);

        if (isArgOption) {
            if (CHANGE_OPTS.message.names.includes(arg)) {
                currOption = "msg";
            } else {
                currOption = "desc";
                isDescProvided = true;
            }
        } else {
            if (currOption === "msg") {
                msg = arg;
                currOption = undefined;
            } else if (currOption === "desc") {
                desc = arg;
                currOption = undefined;
            } else {
                return log.error(`invalid argument '${arg}'`);
            }
        }
    }

    if (!msg) return log.error("messages are mandatory");
    if (isDescProvided && !desc) return log.error("found description option but no value");

    let REF_TREE = createFileTree(`${VECO_DIR}/.veco/ref`, true) as File[];

    if (fs.existsSync(`${VECO_DIR}/.veco/order`)) {
        const order: string[] = fs.readFileSync(`${VECO_DIR}/.veco/order`).toString().split("\n");

        // TODO: CompileLastChange
        // REF_TREE = CompileLastChange(order);
    }

    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const allDifferences = compareTwoTrees(REF_TREE, CURR_TREE);

    let focusesFileContent = fs.readFileSync(FOCUSFILE_PATH).toString().split("\n");
    let focuses = [];

    for (let focusPath of focusesFileContent) {
        if (!focusPath) continue;

        if (fs.statSync(focusPath).isDirectory()) {
            focuses.push(...createFileTree(focusPath, false, true));
        }

        focuses.push(focusPath);
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
