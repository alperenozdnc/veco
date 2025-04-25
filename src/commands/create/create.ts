import { handleCmd } from "../../functions";
import { Action } from "../../interfaces";

import { createChange } from "./createChange";
import { createIgnore } from "./createIgnore";
import { createProject } from "./createProject";

export function create(args: string[]) {
    const cmd = args[0];
    const restOfArgs = args.slice(1);

    const actions: Action[] = [
        { name: "project", run: () => createProject(restOfArgs) },
        { name: "change", run: () => createChange(restOfArgs) },
        { name: "ignore", run: () => createIgnore(restOfArgs) },
    ]

    handleCmd(actions, cmd, "create");
}
