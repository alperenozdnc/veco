import { Command } from "../interfaces";
import { log, padLeft } from "../utils";

export function help(commands: Command[]) {
    const REPO_URL = "https://github.com/alperenozdnc/veco";
    const LICENSE_URL = "https://www.gnu.org/licenses/gpl-3.0.en.html";

    log.usage("veco [COMMAND]... [OPTIONS]...", [], [], []);
    console.log("A basic and archaic version control program.\n")

    const lines: [string, string][] = [];
    const output: string[] = [];

    for (const command of commands) {
        const callers: string = command.callers.join(", ");

        lines.push([`${callers}  ->  `, command.description]);
    }

    const lengths = lines.map((line) => line[0].length + line[1].length);
    const maxLength = Math.max(...lengths);

    for (const line of lines) {
        const minLength = `${line[0]}${line[1]}`.length;

        if (minLength < maxLength) {
            output.push(`${line[0]}${" ".repeat(maxLength - minLength)}${line[1]}`);
        } else {
            output.push(`${line[0]}${line[1]}`);
        }
    }

    padLeft(output);

    console.log(`\nFor online documentation: <${REPO_URL}>`);
    console.log(`For seeing the license: <${LICENSE_URL}>`)
}
