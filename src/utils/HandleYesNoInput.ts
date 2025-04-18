import readlineSync from "readline-sync";

export function HandleYesNoInput(question: string): boolean {
    const input = readlineSync.question(`${question} [y/n] `);

    return input === "y" || input === "yes";
}
