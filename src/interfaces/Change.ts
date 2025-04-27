import { Difference } from ".";

export interface Change {
    ID: string;
    msg: string;
    desc?: string;
    MOD: Difference[];
    INIT: Difference[];
    DEL: Difference[];
}

