import { File } from "./File";

export interface Difference {
    operation: "MOD" | "DEL" | "INIT",
    file: File,
    newFile?: File
}
