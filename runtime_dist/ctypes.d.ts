/**
 * Types for C API.
 */
/** A pointer to points to the raw address space. */
export declare type Pointer = number;
/** A pointer offset, need to add a base address to get a valid ptr. */
export declare type PtrOffset = number;
/**
 * const char *TVMGetLastError();
 */
export declare type FTVMGetLastError = () => Pointer;
/**
 * int TVMModGetFunction(TVMModuleHandle mod,
 *                       const char* func_name,
 *                       int query_imports,
 *                       TVMFunctionHandle *out);
 */
export declare type FTVMModGetFunction = (mod: Pointer, funcName: Pointer, queryImports: number, out: Pointer) => number;
/**
 * int TVMModImport(TVMModuleHandle mod,
 *                  TVMModuleHandle dep);
 */
export declare type FTVMModImport = (mod: Pointer, dep: Pointer) => number;
/**
 * int TVMModFree(TVMModuleHandle mod);
 */
export declare type FTVMModFree = (mod: Pointer) => number;
/**
 * int TVMFuncFree(TVMFunctionHandle func);
 */
export declare type FTVMFuncFree = (func: Pointer) => number;
/**
 * int TVMFuncCall(TVMFunctionHandle func,
 *                 TVMValue* arg_values,
 *                 int* type_codes,
 *                 int num_args,
 *                 TVMValue* ret_val,
 *                 int* ret_type_code);
 */
export declare type FTVMFuncCall = (func: Pointer, argValues: Pointer, typeCode: Pointer, nargs: number, retValue: Pointer, retCode: Pointer) => number;
/**
 * int TVMCFuncSetReturn(TVMRetValueHandle ret,
 *                       TVMValue* value,
 *                       int* type_code,
 *                       int num_ret);
 */
export declare type FTVMCFuncSetReturn = (ret: Pointer, value: Pointer, typeCode: Pointer, numRet: number) => number;
/**
 * int TVMCbArgToReturn(TVMValue* value, int* code);
 */
export declare type FTVMCbArgToReturn = (value: Pointer, code: Pointer) => number;
/**
 * int TVMFuncListGlobalNames(int* outSize, const char*** outArray);
 */
export declare type FTVMFuncListGlobalNames = (outSize: Pointer, outArray: Pointer) => number;
/**
 * int TVMFuncRegisterGlobal(
 *    const char* name, TVMFunctionHandle f, int override);
 */
export declare type FTVMFuncRegisterGlobal = (name: Pointer, f: Pointer, override: number) => number;
/**
 *int TVMFuncGetGlobal(const char* name, TVMFunctionHandle* out);
    */
export declare type FTVMFuncGetGlobal = (name: Pointer, out: Pointer) => number;
/**
 * int TVMArrayAlloc(const tvm_index_t* shape,
 *                   int ndim,
 *                   int dtype_code,
 *                   int dtype_bits,
 *                   int dtype_lanes,
 *                   int device_type,
 *                   int device_id,
 *                   TVMArrayHandle* out);
 */
export declare type FTVMArrayAlloc = (shape: Pointer, ndim: number, dtypeCode: number, dtypeBits: number, dtypeLanes: number, deviceType: number, deviceId: number, out: Pointer) => number;
/**
 * int TVMArrayFree(TVMArrayHandle handle);
 */
export declare type FTVMArrayFree = (handle: Pointer) => number;
/**
 * int TVMArrayCopyFromBytes(TVMArrayHandle handle,
 *                           void* data,
 *                           size_t nbytes);
 */
export declare type FTVMArrayCopyFromBytes = (handle: Pointer, data: Pointer, nbytes: number) => number;
/**
 * int TVMArrayCopyToBytes(TVMArrayHandle handle,
 *                         void* data,
 *                         size_t nbytes);
 */
export declare type FTVMArrayCopyToBytes = (handle: Pointer, data: Pointer, nbytes: number) => number;
/**
 * int TVMArrayCopyFromTo(TVMArrayHandle from,
 *                        TVMArrayHandle to,
 *                        TVMStreamHandle stream);
 */
export declare type FTVMArrayCopyFromTo = (from: Pointer, to: Pointer, stream: Pointer) => number;
/**
 * int TVMSynchronize(int device_type, int device_id, TVMStreamHandle stream);
 */
export declare type FTVMSynchronize = (deviceType: number, deviceId: number, stream: Pointer) => number;
/**
 * typedef int (*TVMBackendPackedCFunc)(TVMValue* args,
 *                                      int* type_codes,
 *                                      int num_args,
 *                                      TVMValue* out_ret_value,
 *                                      int* out_ret_tcode);
 */
export declare type FTVMBackendPackedCFunc = (argValues: Pointer, argCodes: Pointer, nargs: number, outValue: Pointer, outCode: Pointer) => number;
/** void* TVMWasmAllocSpace(int size); */
export declare type FTVMWasmAllocSpace = (size: number) => Pointer;
/** void TVMWasmFreeSpace(void* data); */
export declare type FTVMWasmFreeSpace = (ptr: Pointer) => void;
/**
 * int TVMWasmPackedCFunc(TVMValue* args,
 *                        int* type_codes,
 *                        int num_args,
 *                        TVMRetValueHandle ret,
 *                        void* resource_handle);
 */
export declare type FTVMWasmPackedCFunc = (args: Pointer, typeCodes: Pointer, nargs: number, ret: Pointer, resourceHandle: Pointer) => number;
/**
 * int TVMWasmFuncCreateFromCFunc(void* resource_handle,
 *                                TVMFunctionHandle *out);
 */
export declare type FTVMWasmFuncCreateFromCFunc = (resource: Pointer, out: Pointer) => number;
/**
 * void TVMWasmPackedCFuncFinalizer(void* resource_handle);
 */
export declare type FTVMWasmPackedCFuncFinalizer = (resourceHandle: Pointer) => void;
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
    TVMValue = 8,
    DLDataType = 4,
    DLContext = 8
}
/**
 * Type code in TVM FFI.
 */
export declare const enum TypeCode {
    Int = 0,
    UInt = 1,
    Float = 2,
    TVMOpaqueHandle = 3,
    Null = 4,
    TVMDataType = 5,
    TVMContext = 6,
    TVMDLTensorHandle = 7,
    TVMObjectHandle = 8,
    TVMModuleHandle = 9,
    TVMPackedFuncHandle = 10,
    TVMStr = 11,
    TVMBytes = 12,
    TVMNDArrayHandle = 13,
    TVMObjectRValueRefArg = 14
}
