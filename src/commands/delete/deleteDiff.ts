import fs from "fs";

import { REF_PATH, VECO_DIR } from "../../constants";
import { log } from "../../utils";
import { File } from "../../interfaces";

import { compareTwoTrees } from "../create/compareTwoTrees";
import { createFileTree } from "../create/createFileTree";
import { updateTree } from "../create/updateTree";

export function deleteDiff() {
    const ORDERFILE_PATH = `${VECO_DIR}/.veco/order`;

    if (!fs.existsSync(ORDERFILE_PATH)) {
        log.error("no changes to revert back to");
        return;
    }

    const ORDERFILE = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");

    ORDERFILE.pop();

    const ID = ORDERFILE[ORDERFILE.length - 1];

    let REF_TREE = createFileTree(REF_PATH, true) as File[];
    const CURR_TREE = createFileTree(`${VECO_DIR}`) as File[];

    const differences = compareTwoTrees(CURR_TREE, REF_TREE)!;

    updateTree(VECO_DIR, differences, false);

    console.log(`Successfully reverted back to ${ID}`);
}
