import { Difference } from "../../interfaces";
import { IGNOREFILE_PATH } from "../../constants";

import { createFileTree } from "./createFileTree";

export function updateRefTree(path: string, change: Difference[]) {
    let refTree = createFileTree(path, true);

    // check ignore file for new ignores to exclude in the reference tree
    // apply changes to refTree
    // write new refTree to path

    return refTree;
}
