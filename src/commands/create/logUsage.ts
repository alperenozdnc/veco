import { log } from "../../utils";

export function logUsage() {
    log.usage(
        "veco %cmd0 %cmd1 %opt0 %arg0 %opt1 %arg1",
        ["create", "change"],
        ["message", "description"],
        [["-M", "msg", "--message"],
        ["-D", "desc", "--description"]],
    );
}
