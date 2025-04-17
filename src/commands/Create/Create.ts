import { LogError } from "../../utils";
import { CreateIgnore } from "./CreateIgnore";

interface CreateAction {
    name: string;
    run: Function;
}

export function Create(args: string[]) {
    const restOfArgs = args.slice(1);

    const actions: CreateAction[] = [
        { name: "project", run: () => { } },
        { name: "change", run: () => { } },
        { name: "ignore", run: () => CreateIgnore(restOfArgs) },
    ]

    const actionInput: string = args[0];

    for (const action of actions) {
        if (action.name === actionInput) return action.run();
    }

    // throw error if invalid create action
    LogError(`invalid create action '${actionInput}'`);
    console.log(`Usage: 'create {${actions.map((action) => action.name).join("|")}}'`)
}
