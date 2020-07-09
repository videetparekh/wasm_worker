dist/wasm/tvmjs_support.bc: emcc/tvmjs_support.cc \
  /usr/tvm/include/tvm/runtime/c_runtime_api.h \
  /usr/tvm/3rdparty/dlpack/include/dlpack/dlpack.h \
  /usr/tvm/include/tvm/runtime/container.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/logging.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./base.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/build_config_default.h \
  /usr/tvm/include/tvm/runtime/memory.h \
  /usr/tvm/include/tvm/runtime/object.h \
  /usr/tvm/include/tvm/runtime/packed_func.h \
  /usr/tvm/include/tvm/runtime/data_type.h \
  /usr/tvm/include/tvm/runtime/module.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/io.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./logging.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./serializer.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./io.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./type_traits.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/./endian.h \
  /usr/tvm/include/tvm/runtime/ndarray.h \
  /usr/tvm/include/tvm/runtime/serializer.h \
  /usr/tvm/3rdparty/dmlc-core/include/dmlc/serializer.h \
  /usr/tvm/include/tvm/runtime/device_api.h \
  /usr/tvm/include/tvm/runtime/registry.h \
  emcc/../../src/runtime/rpc/rpc_local_session.h \
  emcc/../../src/runtime/rpc/rpc_session.h \
  emcc/../../src/runtime/rpc/rpc_protocol.h
