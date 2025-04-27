import { Operation } from "../types";
import { getVecoDir } from "../utils";

export const VECO_DIR = getVecoDir();
export const IGNOREFILE_PATH = `${VECO_DIR}/.vecoig`;
export const FOCUSFILE_PATH = `${VECO_DIR}/.veco/focus`
export const REF_PATH = `${VECO_DIR}/.veco/ref`
export const ORDERFILE_PATH = `${VECO_DIR}/.veco/order`;
export const LOCKFILE_PATH = `${VECO_DIR}/.veco/LOCK`;

export const OPERATION_NAMES: Operation[] = ["MOD", "DEL", "INIT"];
