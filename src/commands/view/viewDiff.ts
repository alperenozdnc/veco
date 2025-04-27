import { REF_PATH, VECO_DIR } from "../../constants";
import { log, parseIgnores, printDiff, readFocuses } from "../../utils";
import { File } from "../../interfaces";

import { createFileTree } from "../create/createFileTree";
import { compareTwoTrees } from "../create/compareTwoTrees";

type Scope = "all" | "focused-only" | "unfocused-only";

function isStrTypeScope(str: any): str is Scope {
    return ["all", "focused-only", "unfocused-only"].includes(str);
}

export function viewDiff(arg: string) {
    if (!isStrTypeScope(arg)) return log.error("enter either all, focused-only, or unfocused-only");

    const REF_TREE = createFileTree(REF_PATH, true) as File[];
    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const differences = compareTwoTrees(REF_TREE, CURR_TREE);
    const ignores = parseIgnores();

    if (!differences) return log.error("nothing to show");

    if (arg === "all") {
        for (const diff of differences) {
            if (ignores.includes(diff.file.path)) {
                continue;
            }

            printDiff(diff);
        }

        return;
    }

    const refFocuses = readFocuses(REF_PATH);
    const focuses = readFocuses();

    for (const diff of differences) {
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
