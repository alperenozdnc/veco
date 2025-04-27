import fs from "fs";

import { Change, Difference } from "../interfaces";
import { OPERATION_NAMES, VECO_DIR } from "../constants";
import { Operation } from "../types";

export function readChangeFromId(ID: string): Change {
    const msgAndDesc = fs.readFileSync(`${VECO_DIR}/.veco/messages/${ID}`).toString().split("\n");
    const msg = msgAndDesc[0];
    const changeDate = new Date(+fs.readFileSync(`${VECO_DIR}/.veco/dates/${ID}`)).toString();

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
