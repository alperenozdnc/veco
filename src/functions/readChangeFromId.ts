import fs from "fs";

import { Change, Difference } from "../interfaces";
import { OPERATION_NAMES, VECO_DIR } from "../constants";
import { Operation } from "../types";

export function readChangeFromId(ID: string): Change {
    // filter is to remove the '' in the middle created because of the space between the msg and desc
    const msgAndDesc = fs.readFileSync(`${VECO_DIR}/.veco/messages/${ID}`).toString().split("\n").filter(str => str);

    const msg = msgAndDesc[0];
    const changeDate = fs.readFileSync(`${VECO_DIR}/.veco/dates/${ID}`).toString();

    const operations: Record<Operation, Difference[]> = {
        MOD: [],
        DEL: [],
        INIT: []
    };

    for (const operation of OPERATION_NAMES) {
        const data: Difference[] = JSON.parse(fs.readFileSync(`${VECO_DIR}/.veco/changes/${ID}/${operation}`).toString());

        operations[operation] = data;
    }

    return {
        ID: ID,
        msg: msg,
        desc: msgAndDesc[1] ?? null,
        ...operations,
        date: changeDate
    };
};
