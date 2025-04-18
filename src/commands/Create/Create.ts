import { CheckVecoDirectory, LogError } from "../../utils";
import { CreateChange } from "./CreateChange";
import { CreateIgnore } from "./CreateIgnore";
import { CreateProject } from "./CreateProject";

interface CreateAction {
    name: string;
    run: Function;
}

export function Create(args: string[]) {
    const restOfArgs = args.slice(1);

    const actions: CreateAction[] = [
        { name: "project", run: () => CreateProject(restOfArgs) },
        { name: "change", run: () => CreateChange() },
        { name: "ignore", run: () => CreateIgnore(restOfArgs) },
    ]

    const actionInput: string = args[0];
    const isProject = CheckVecoDirectory();

    if (isProject || actionInput === "project") {
        for (const action of actions) {
            if (action.name === actionInput) return action.run();
        }

        // throw error if invalid create action
        LogError(`invalid create action '${actionInput}'`);
        console.log(`Usage: 'create {${actions.map((action) => action.name).join("|")}}'`)
    } else {
        LogError(`no veco project found in this or any parent directories`);
        console.log("\nYou must run create commands inside a project.");
        console.log("'veco create project' to create a project.");
    }
}
