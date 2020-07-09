/**
 * Types for C API.
 */
/** A pointer to points to the raw address space. */
export declare type Pointer = number;
/** A pointer offset, need to add a base address to get a valid ptr. */
export declare type PtrOffset = number;
/**
 * const char *LREGetLastError();
 */
export declare type FLREGetLastError = () => Pointer;
/**
 * int LREModGetFunction(LREModuleHandle mod,
 *                       const char* func_name,
 *                       int query_imports,
 *                       LREFunctionHandle *out);
 */
export declare type FLREModGetFunction = (mod: Pointer, funcName: Pointer, queryImports: number, out: Pointer) => number;
/**
 * int LREModImport(LREModuleHandle mod,
 *                  LREModuleHandle dep);
 */
export declare type FLREModImport = (mod: Pointer, dep: Pointer) => number;
/**
 * int LREModFree(LREModuleHandle mod);
 */
export declare type FLREModFree = (mod: Pointer) => number;
/**
 * int LREFuncFree(LREFunctionHandle func);
 */
export declare type FLREFuncFree = (func: Pointer) => number;
/**
 * int LREFuncCall(LREFunctionHandle func,
 *                 LREValue* arg_values,
 *                 int* type_codes,
 *                 int num_args,
 *                 LREValue* ret_val,
 *                 int* ret_type_code);
 */
export declare type FLREFuncCall = (func: Pointer, argValues: Pointer, typeCode: Pointer, nargs: number, retValue: Pointer, retCode: Pointer) => number;
/**
 * int LRECFuncSetReturn(LRERetValueHandle ret,
 *                       LREValue* value,
 *                       int* type_code,
 *                       int num_ret);
 */
export declare type FLRECFuncSetReturn = (ret: Pointer, value: Pointer, typeCode: Pointer, numRet: number) => number;
/**
 * int LRECbArgToReturn(LREValue* value, int* code);
 */
export declare type FLRECbArgToReturn = (value: Pointer, code: Pointer) => number;
/**
 * int LREFuncListGlobalNames(int* outSize, const char*** outArray);
 */
export declare type FLREFuncListGlobalNames = (outSize: Pointer, outArray: Pointer) => number;
/**
 * int LREFuncRegisterGlobal(
 *    const char* name, LREFunctionHandle f, int override);
 */
export declare type FLREFuncRegisterGlobal = (name: Pointer, f: Pointer, override: number) => number;
/**
 *int LREFuncGetGlobal(const char* name, LREFunctionHandle* out);
    */
export declare type FLREFuncGetGlobal = (name: Pointer, out: Pointer) => number;
/**
 * int LREArrayAlloc(const lre_index_t* shape,
 *                   int ndim,
 *                   int dtype_code,
 *                   int dtype_bits,
 *                   int dtype_lanes,
 *                   int device_type,
 *                   int device_id,
 *                   LREArrayHandle* out);
 */
export declare type FLREArrayAlloc = (shape: Pointer, ndim: number, dtypeCode: number, dtypeBits: number, dtypeLanes: number, deviceType: number, deviceId: number, out: Pointer) => number;
/**
 * int LREArrayFree(LREArrayHandle handle);
 */
export declare type FLREArrayFree = (handle: Pointer) => number;
/**
 * int LREArrayCopyFromBytes(LREArrayHandle handle,
 *                           void* data,
 *                           size_t nbytes);
 */
export declare type FLREArrayCopyFromBytes = (handle: Pointer, data: Pointer, nbytes: number) => number;
/**
 * int LREArrayCopyToBytes(LREArrayHandle handle,
 *                         void* data,
 *                         size_t nbytes);
 */
export declare type FLREArrayCopyToBytes = (handle: Pointer, data: Pointer, nbytes: number) => number;
/**
 * int LREArrayCopyFromTo(LREArrayHandle from,
 *                        LREArrayHandle to,
 *                        LREStreamHandle stream);
 */
export declare type FLREArrayCopyFromTo = (from: Pointer, to: Pointer, stream: Pointer) => number;
/**
 * int LRESynchronize(int device_type, int device_id, LREStreamHandle stream);
 */
export declare type FLRESynchronize = (deviceType: number, deviceId: number, stream: Pointer) => number;
/**
 * typedef int (*LREBackendPackedCFunc)(LREValue* args,
 *                                      int* type_codes,
 *                                      int num_args,
 *                                      LREValue* out_ret_value,
 *                                      int* out_ret_tcode);
 */
export declare type FLREBackendPackedCFunc = (argValues: Pointer, argCodes: Pointer, nargs: number, outValue: Pointer, outCode: Pointer) => number;
/** void* LREWasmAllocSpace(int size); */
export declare type FLREWasmAllocSpace = (size: number) => Pointer;
/** void LREWasmFreeSpace(void* data); */
export declare type FLREWasmFreeSpace = (ptr: Pointer) => void;
/**
 * int LREWasmPackedCFunc(LREValue* args,
 *                        int* type_codes,
 *                        int num_args,
 *                        LRERetValueHandle ret,
 *                        void* resource_handle);
 */
export declare type FLREWasmPackedCFunc = (args: Pointer, typeCodes: Pointer, nargs: number, ret: Pointer, resourceHandle: Pointer) => number;
/**
 * int LREWasmFuncCreateFromCFunc(void* resource_handle,
 *                                LREFunctionHandle *out);
 */
export declare type FLREWasmFuncCreateFromCFunc = (resource: Pointer, out: Pointer) => number;
/**
 * void LREWasmPackedCFuncFinalizer(void* resource_handle);
 */
export declare type FLREWasmPackedCFuncFinalizer = (resourceHandle: Pointer) => void;
/**
 * Size of common data types.
 */
export declare const enum SizeOf {
    U8 = 1,
    U16 = 2,
    I32 = 4,
    I64 = 8,
    F32 = 4,
    F64 = 8,
    LREValue = 8,
    DLDataType = 4,
    DLContext = 8
}
/**
 * Type code in LRE FFI.
 */
export declare const enum TypeCode {
    Int = 0,
    UInt = 1,
    Float = 2,
    LREOpaqueHandle = 3,
    Null = 4,
    LREDataType = 5,
    LREContext = 6,
    LREDLTensorHandle = 7,
    LREObjectHandle = 8,
    LREModuleHandle = 9,
    LREPackedFuncHandle = 10,
    LREStr = 11,
    LREBytes = 12,
    LRENDArrayHandle = 13,
    LREObjectRValueRefArg = 14
}
