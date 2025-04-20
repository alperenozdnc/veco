import fs from "fs";
import sha from "sha1";

import { VECO_DIR, FOCUSFILE_PATH, IGNOREFILE_PATH } from "../../constants";
import { log } from "../../utils";

interface File {
    name: string;
    path: string;
    content: string;
}

interface Difference {
    operation: "MOD" | "DEL" | "INIT",
    file: File,
    newFile?: File
}

function LogUsage() {
    console.log("Usage: 'veco create change <-M/msg/--message> {message} <-D/desc/--description> {description}'");
}

function CreateFileTree(root: string, isRef: boolean = false, isFilenameTree = false): (string | File)[] {
    const directoryContents = fs.readdirSync(root);
    const tree = [];

    for (const filename of directoryContents) {
        const path = `${root}/${filename}`;
        const fileIsDir = fs.statSync(path).isDirectory();

        if (fileIsDir) {
            if (filename === ".veco") continue;
            if (fs.existsSync(IGNOREFILE_PATH)) {
                const ignores = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");

                if (ignores.includes(path)) continue;
            }

            tree.push(...CreateFileTree(path, isRef, isFilenameTree));

            continue;
        }

        if (isFilenameTree) {
            tree.push(path);
        } else {
            tree.push({
                name: filename,
                path: isRef ? path.split(".veco/ref/").join("") : path,
                content: fs.readFileSync(path).toString()
            })
        }

    }

    return tree;
}

function CompareTwoTrees(treeA: File[], treeB: File[]): Difference[] | null {
    if (JSON.stringify(treeA) === JSON.stringify(treeB)) {
        return null;
    }

    const differences: Difference[] = [];
    let supposedTreeBLength = treeA.length;

    for (const fileA of treeA) {
        const { path: pathA, content: contentA } = fileA;
        const fileB = treeB.find(({ path: pathB }) => pathA === pathB);

        if (!fileB) {
            differences.push({ operation: "DEL", file: fileA });
            supposedTreeBLength--;

            continue;
        }

        if (contentA !== fileB.content) {
            differences.push({ operation: "MOD", file: fileA, newFile: fileB });
            continue;
        }
    }

    if (treeB.length > supposedTreeBLength) {
        for (const fileB of treeB) {
            const { path: pathB } = fileB;
            const fileA = treeA.find(({ path: pathA }) => pathA === pathB);

            if (fileA) continue;

            differences.push({ operation: "INIT", file: fileB });
        }
    }

    return differences.length > 0 ? differences : null;
}

function CompileLastChange(order: string[]): File[] {
    return [];
}

export function CreateChange(args: string[]) {
    const DATE_UNIX_TIME: number = Date.now();
    const ID = sha(DATE_UNIX_TIME.toString()).substring(0, 10);

    const CHANGE_OPTS = {
        message: { names: ["-M", "msg", "--message"], label: "msg" },
        description: { names: ["-D", "desc", "--description"], label: "desc" }
    };

    if (args.length < 2) {
        log.error("insufficient arguments");
        LogUsage();
        return;
    }

    const hasMsgOption = args.some((arg: string) => CHANGE_OPTS.message.names.includes(arg));

    if (!hasMsgOption) {
        log.error("message option is mandatory.")
        LogUsage();
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

    let REF_TREE = CreateFileTree(`${VECO_DIR}/.veco/ref`, true) as File[];

    if (fs.existsSync(`${VECO_DIR}/.veco/order`)) {
        const order: string[] = fs.readFileSync(`${VECO_DIR}/.veco/order`).toString().split("\n");

        // TODO: CompileLastChange
        // REF_TREE = CompileLastChange(order);
    }

    const CURR_TREE = CreateFileTree(`${VECO_DIR}`) as File[];

    const allDifferences = CompareTwoTrees(REF_TREE, CURR_TREE);

    let focusesFileContent = fs.readFileSync(FOCUSFILE_PATH).toString().split("\n");
    let focuses = [];

    for (let focusPath of focusesFileContent) {
        if (!focusPath) continue;

        if (fs.statSync(focusPath).isDirectory()) {
            focuses.push(...CreateFileTree(focusPath, false, true));
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
