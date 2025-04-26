import { Action } from "../../interfaces";
import { handleCmd } from "../../functions";

import { viewIgnores } from "./viewIgnores";
import { viewDiff } from "./viewDiff";
import { viewChanges } from "./viewChanges";

export async function view(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "ignores", run: () => viewIgnores() },
        { name: "changes", run: () => viewChanges() },
        { name: "diff", run: () => viewDiff(restOfArgs[0]) },
    ]

    handleCmd(actions, cmd, "view");
}
