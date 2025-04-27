import fs from "fs";

import { readChangeFromId } from ".";

import { isLastChange, log } from "../utils";
import { Change, Difference } from "../interfaces";
import { OPERATION_NAMES, ORDERFILE_PATH, VECO_DIR } from "../constants";
import { Operation } from "../types";
import { createChange } from "../commands/create/createChange";
import { updateTree } from "../commands/create/updateTree";
import { focus } from "../commands";

export function revertToChange(targetChange: Change) {
    if (isLastChange(targetChange.ID)) {
        log.error("can't revert back to last change, 'veco delete diff' to delete all unapplied changes");
        process.exit();
    }

    const order = fs.readFileSync(ORDERFILE_PATH).toString().split("\n");
    order.pop();

    const changes: Change[] = [];
    const reversedChanges: Change[] = [];

    // reversing cause last change is the first to be reverted
    for (const changeID of order.reverse()) {
        const change = readChangeFromId(changeID);

        // no need to reverse any changes created after target
        if (change.date < targetChange.date || change.date === targetChange.date) {
            continue;
        };

        changes.push(change);
    }

    for (const change of changes) {
        const operations: Difference[] = [...change.MOD, ...change.INIT, ...change.DEL];
        let newOperations: Difference[] = [];

        for (let i = 0; i < operations.length; i++) {
            const operation = operations[i];
            const operationName: Operation = operation.operation;

            if (operationName === "MOD") {
                newOperations.push({ operation: "MOD", file: operation.newFile!, newFile: operation.file });
                continue;
            }

            newOperations.push({ operation: operationName === "INIT" ? "DEL" : "INIT", file: operation.file });
        }

        const { date, ID, msg, desc } = change;

        const reversedOperations: Record<Operation, Difference[]> = {
            MOD: [],
            INIT: [],
            DEL: []
        };

        for (const name of OPERATION_NAMES) {
            reversedOperations[name] = newOperations.filter(diff => diff.operation === name);
        }

        reversedChanges.push({ ID, date, msg, desc, ...reversedOperations });
        console.log(`[REVERT LOG] reversing ${ID}...`);
    }

    // read all reversed changes, apply them on veco dir one by one
    for (const change of reversedChanges) {
        console.log(`[REVERT LOG] undoing ${change.ID}...`);
        updateTree(VECO_DIR, [...change.INIT, ...change.MOD, ...change.DEL], false);
    }

    // focus all reversed changes
    console.log(`[REVERT LOG] focusing all reverted diffs...`);
    focus(["."], true);

    // create a new change that is with the msg "revert to id"
    console.log(`[REVERT LOG] saving revert action in a new change...`);
    createChange(["-M", `revert to ${targetChange.ID}`, "-D", "Change created automatically by veco."]);

    console.log(`[REVERT LOG] successfully reverted back to ${targetChange.ID}`);
    console.log(`[REVERT LOG] 'veco revert ${reversedChanges[0].ID}' to undo the reverting`);

    return;
}
