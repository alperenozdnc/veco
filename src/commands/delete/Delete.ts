import { handleModCmd } from "../../functions";
import { Action } from "../../interfaces";

import { deleteIgnore } from "./deleteIgnore";
import { deleteProject } from "./deleteProject";

// NOT `delete` because it's a keyword
export function Delete(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "project", run: () => deleteProject() },
        { name: "change", run: () => { } },
        { name: "ignore", run: () => deleteIgnore(restOfArgs) },
    ]

    handleModCmd(actions, cmd, "delete");
}
