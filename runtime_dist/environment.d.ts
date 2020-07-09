import { LibraryProvider } from "./types";
import * as ctypes from "./ctypes";
/**
 * Environment to impelement most of the JS library functions.
 */
export declare class Environment implements LibraryProvider {
    logger: (msg: string) => void;
    imports: Record<string, any>;
    /**
     * Maintains a table of FLREWasmPackedCFunc that the C part
     * can call via LREWasmPackedCFunc.
     *
     * We maintain a separate table so that we can have un-limited amount
     * of functions that do not maps to the address space.
     */
    packedCFuncTable: Array<ctypes.FLREWasmPackedCFunc | undefined>;
    /**
     * Free table index that can be recycled.
     */
    packedCFuncTableFreeId: Array<number>;
    private libProvider?;
    constructor(importObject?: Record<string, any>, logger?: (msg: string) => void);
    /** Mark the start of the instance. */
    start(inst: WebAssembly.Instance): void;
    private environment;
}
