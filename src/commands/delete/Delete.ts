import { handleCmd } from "../../functions";
import { Action } from "../../interfaces";

import { deleteIgnore } from "./deleteIgnore";
import { deleteProject } from "./deleteProject";
import { deleteDiff } from "./deleteDiff";

// NOT `delete` because it's a keyword
export function Delete(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "project", run: () => deleteProject() },
        { name: "diff", run: () => deleteDiff() },
        { name: "ignore", run: () => deleteIgnore(restOfArgs) },
    ]

    handleCmd(actions, cmd, "delete");
}
