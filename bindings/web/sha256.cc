#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <openssl/sha.h>

#define DIGEST_LENGTH 32

using namespace emscripten;

class C_SHA256
{
  public:
    static val context()
    {
        SHA256_CTX* context;

        SHA256_Init(context);

        return val(typed_memory_view(sizeof(SHA256_CTX), (unsigned char*) context));
    }

    static void update(size_t context_offset, size_t data_offset, size_t data_length)
    {
        SHA256_CTX* context = (SHA256_CTX*) context_offset;
        unsigned char* data = (unsigned char*) data_offset;

        SHA256_Update(context, data, data_length);
    }

    static val finalize(size_t context_offset)
    {
        SHA256_CTX* context = (SHA256_CTX*) context_offset;

        unsigned char hash[DIGEST_LENGTH];

        SHA256_Final(hash, context);

        return val(typed_memory_view(DIGEST_LENGTH, hash));
    }
};

EMSCRIPTEN_BINDINGS(C_SHA256)
{
    class_<C_SHA256>("SHA256")
        .class_function("context", &C_SHA256::context)
        .class_function("update", &C_SHA256::update)
        .class_function("finalize", &C_SHA256::finalize);
}
