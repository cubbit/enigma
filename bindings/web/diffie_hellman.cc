#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <openssl/evp.h>
#include <openssl/ec.h>
#include <openssl/pem.h>

using namespace emscripten;

#define ERROR(V, TEST)                                                                   \
    if(error_return.isNull() && (TEST))                                                  \
    {                                                                                    \
        unsigned char error_code[2];                                                            \
        error_code[0] = V;                                                               \
        error_code[1] = 0;                                                               \
        error_return = val(typed_memory_view(2 * sizeof(char), (unsigned char*)(&error_code))); \
    }

#define ERRORC(V, TEST, EQ)                                                                  \
    {                                                                                        \
        size_t a = (size_t)TEST;                                                             \
        if(error_return.isNull() && a EQ)                                                    \
        {                                                                                    \
            unsigned char error_code[2];                                                            \
            error_code[0] = V;                                                               \
            error_code[1] = a;                                                               \
            error_return = val(typed_memory_view(2 * sizeof(char), (unsigned char*)(&error_code))); \
        }                                                                                    \
    }

class DiffieHellman
{
  public:
    static val generate_private_key()
    {
        EVP_PKEY* params = NULL;
        EVP_PKEY_CTX* parameters_context = NULL;
        EVP_PKEY_CTX* key_generation_context = NULL;
        EVP_PKEY* private_key = NULL ;
        val error_return = val::null();

        parameters_context = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, nullptr);
        ERROR(1, parameters_context == nullptr);

        ERRORC(2, EVP_PKEY_paramgen_init(parameters_context), != 1);

        ERRORC(3, EVP_PKEY_CTX_set_ec_paramgen_curve_nid(parameters_context, NID_X9_62_prime256v1), != 1);

        ERRORC(4, EVP_PKEY_paramgen(parameters_context, &params), != 1);

        if(!error_return.isNull())
        {
            EVP_PKEY_CTX_free(parameters_context);
            return error_return;
        }

        key_generation_context = EVP_PKEY_CTX_new(params, nullptr);
        ERROR(5, key_generation_context == nullptr);

        if(!error_return.isNull())
        {
            EVP_PKEY_CTX_free(parameters_context);
            return error_return;
        }

        ERRORC(6, EVP_PKEY_keygen_init(key_generation_context), != 1);

        ERRORC(0, EVP_PKEY_keygen(key_generation_context, &private_key), != 1);

        EVP_PKEY_CTX_free(parameters_context);
        EVP_PKEY_CTX_free(key_generation_context);

        if(!error_return.isNull())
            return error_return;

        return val(typed_memory_view((size_t) EVP_PKEY_size(private_key), (unsigned char*)private_key));
    }

    static val get_public_key(size_t private_key_offset)
    {
        BIO* in_memory_buffer;
        BUF_MEM* in_memory_buffer_content_ptr;
        EVP_PKEY* private_key;
        val error_return = val::null();

        private_key = (EVP_PKEY*) private_key_offset;
        ERROR(10, private_key == nullptr);

        if(!error_return.isNull())
            return error_return;

        in_memory_buffer = BIO_new(BIO_s_mem());

        ERRORC(11, PEM_write_bio_PUBKEY(in_memory_buffer, private_key), != 1)

        if(!error_return.isNull())
        {
            BIO_free(in_memory_buffer);
            return error_return;
        }
        BIO_get_mem_ptr(in_memory_buffer, &in_memory_buffer_content_ptr);

        // uint8_t public_key[in_memory_buffer_content_ptr->length];
        // // public_key.resize(in_memory_buffer_content_ptr->length);

        // memcpy((void*)&public_key[0], in_memory_buffer_content_ptr->data, in_memory_buffer_content_ptr->length);

        // BIO_free(in_memory_buffer);

        return val(typed_memory_view((size_t)in_memory_buffer_content_ptr->length, (unsigned char*)in_memory_buffer_content_ptr->data));
    }

    static val derive_secret(size_t private_key_offset, size_t peer_public_key_offset, size_t peer_public_key_length)
    {
        bool ret;
        size_t secret_length;
        EVP_PKEY* private_key;
        BUF_MEM* bptr;
        BIO* bp;
        EVP_PKEY* peer_key;
        EVP_PKEY_CTX* shared_secret_context;
        uint8_t* peer_public_key;
        val error_return = val::null();
        int error_code = 0;

        peer_public_key = (uint8_t*) private_key_offset;

        private_key = (EVP_PKEY*) private_key_offset;
        
        ERROR(20, private_key == nullptr);

        if(!error_return.isNull())
            return error_return;

        bptr = BUF_MEM_new();

        BUF_MEM_grow(bptr, peer_public_key_length);

        bp = BIO_new(BIO_s_mem());

        memcpy(bptr->data, peer_public_key, peer_public_key_length);

        BIO_set_mem_buf(bp, bptr, BIO_NOCLOSE);

        peer_key = PEM_read_bio_PUBKEY(bp, nullptr, nullptr, nullptr);

        BIO_free(bp);
        BUF_MEM_free(bptr);

        shared_secret_context = EVP_PKEY_CTX_new(private_key, nullptr);

        ERROR(21, shared_secret_context == nullptr);

        if(!error_return.isNull())
            return error_return;

        ERRORC(22, EVP_PKEY_derive_init(shared_secret_context), != 1);
        ERRORC(23, EVP_PKEY_derive_set_peer(shared_secret_context, peer_key), != 1);
        ERRORC(24, EVP_PKEY_derive(shared_secret_context, nullptr, &secret_length), != 1);

        if(!error_return.isNull())
        {
            EVP_PKEY_CTX_free(shared_secret_context);
            return error_return;
        }

        uint8_t shared_secret[secret_length];

        ERRORC(25, EVP_PKEY_derive(shared_secret_context, &shared_secret[0], &secret_length), != 1)

        if(!error_return.isNull())
        {
            EVP_PKEY_CTX_free(shared_secret_context);
            return error_return;
        }

        EVP_PKEY_CTX_free(shared_secret_context);

        return val(typed_memory_view(secret_length,  shared_secret));
    }
};

EMSCRIPTEN_BINDINGS(DiffieHellman)
{
    class_<DiffieHellman>("DiffieHellman")
        .class_function("generate_private_key", &DiffieHellman::generate_private_key)
        .class_function("get_public_key", &DiffieHellman::get_public_key)
        .class_function("derive_secret", &DiffieHellman::derive_secret);
}