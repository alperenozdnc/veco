import fs from "fs";

import { checkVecoDir, log } from "../../utils";
import { IGNOREFILE_PATH } from "../../constants";

export function view(args: string[]) {
    if (!checkVecoDir()) return log.error("this command must be run in a veco directory");

    if (args[0] === "ignores") {
        if (args.length > 1) log.warning(`ignoring args after 'ignores'`);
        if (!fs.existsSync(IGNOREFILE_PATH)) return log.error("no ignore file, create .vecoig file to see ignores");

        const IGNORES = fs.readFileSync(IGNOREFILE_PATH).toString().split("\n");

        IGNORES.pop();

        console.log(`ignores (${IGNORES.length} total): `);

        for (const ignore of IGNORES) console.log(`  ${ignore}`)
    }
}
