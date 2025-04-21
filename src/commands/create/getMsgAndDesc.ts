import { log } from "../../utils";
import { logUsage } from "./logUsage";


export function getMsgAndDesc(args: string[]): { msg: string, desc?: string, isDescProvided: boolean } {
    const CHANGE_OPTS = {
        message: { names: ["-M", "msg", "--message"], label: "msg" },
        description: { names: ["-D", "desc", "--description"], label: "desc" }
    };

    if (args.length < 2) {
        log.error("insufficient arguments");
        logUsage();
        process.exit();
    }

    const hasMsgOption = args.some((arg: string) => CHANGE_OPTS.message.names.includes(arg));

    if (!hasMsgOption) {
        log.error("message option is mandatory.")
        logUsage();
        process.exit();
    }

    let currOption: "msg" | "desc" | undefined;

    let isDescProvided = false;

    let msg: string = "";
    let desc: string | undefined;

    for (const arg of args) {
        const options = [...CHANGE_OPTS.message.names, ...CHANGE_OPTS.description.names];
        const isArgOption = options.includes(arg);

        if (isArgOption) {
            if (CHANGE_OPTS.message.names.includes(arg)) {
                currOption = "msg";
            } else {
                currOption = "desc";
                isDescProvided = true;
            }
        } else {
            if (currOption === "msg") {
                msg = arg;
                currOption = undefined;
            } else if (currOption === "desc") {
                desc = arg;
                currOption = undefined;
            } else {
                log.error(`invalid argument '${arg}'`);
                process.exit();
            }
        }
    }

    if (!msg) {
        log.error("messages are mandatory");
        process.exit();
    }

    if (isDescProvided && !desc) {
        log.error("found description option but no value");
        process.exit();
    }

    return { msg: msg, desc: desc, isDescProvided: isDescProvided };
}
