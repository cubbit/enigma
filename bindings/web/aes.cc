#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <openssl/bio.h>
#include <openssl/evp.h>

#define TAG_LENGTH 16

using namespace emscripten;

class AES
{
  public:
    static val encrypt_context(std::string algorithm, size_t key_length, size_t key_offset, size_t iv_length, size_t iv_offset)
    {
        EVP_CIPHER_CTX* context = EVP_CIPHER_CTX_new();

        // TODO: select initi from algorithm and key_size
        EVP_EncryptInit_ex(context, EVP_aes_256_gcm(), NULL, NULL, NULL);
        EVP_CIPHER_CTX_ctrl(context, EVP_CTRL_GCM_SET_IVLEN, iv_length, NULL);

        unsigned char* key = (unsigned char*) key_offset;
        unsigned char* iv = (unsigned char*) iv_offset;

        EVP_EncryptInit_ex(context, NULL, NULL, key, iv);

        return val(typed_memory_view(sizeof(EVP_CIPHER_CTX), (unsigned char*) context));
    }

    static val encrypt(size_t context_offset, size_t plain_offset, size_t plain_length)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*) context_offset;
        unsigned char* plain = (unsigned char*) plain_offset;

        int cipher_length;
        unsigned char* cipher = (unsigned char*) malloc(plain_length);

        EVP_EncryptUpdate(context, cipher, &cipher_length, plain, plain_length);

        return val(typed_memory_view(cipher_length, cipher));
    }

    static val encrypt_finalize(size_t context_offset)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*) context_offset;

        int cipher_length;
        // TODO: 1024 enough?
        unsigned char* cipher = (unsigned char*) malloc(1024);

        EVP_EncryptFinal_ex(context, cipher, &cipher_length);

        return val(typed_memory_view(cipher_length, cipher));
    }

    static val get_tag(size_t context_offset)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*) context_offset;

        unsigned char tag[TAG_LENGTH];

        EVP_CIPHER_CTX_ctrl(context, EVP_CTRL_GCM_GET_TAG, TAG_LENGTH, tag);

        return val(typed_memory_view(TAG_LENGTH, tag));
    }

    static val decrypt_context(std::string algorithm, size_t key_length, size_t key_offset, size_t iv_length, size_t iv_offset)
    {
        EVP_CIPHER_CTX* context = EVP_CIPHER_CTX_new();

        // TODO: select initi from algorithm and key_size
        EVP_DecryptInit_ex(context, EVP_aes_256_gcm(), NULL, NULL, NULL);
        EVP_CIPHER_CTX_ctrl(context, EVP_CTRL_GCM_SET_IVLEN, iv_length, NULL);

        unsigned char* key = (unsigned char*)key_offset;
        unsigned char* iv = (unsigned char*)iv_offset;

        EVP_DecryptInit_ex(context, NULL, NULL, key, iv);

        return val(typed_memory_view(sizeof(EVP_CIPHER_CTX), (unsigned char*) context));
    }

    static val decrypt(size_t context_offset, size_t cipher_offset, size_t cipher_length)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*) context_offset;
        unsigned char* cipher = (unsigned char*) cipher_offset;

        int plain_length;
        unsigned char* plain = (unsigned char*) malloc(cipher_length);

        EVP_DecryptUpdate(context, plain, &plain_length, cipher, cipher_length);

        return val(typed_memory_view(plain_length, plain));
    }

    static val decrypt_finalize(size_t context_offset)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*)context_offset;

        int plain_length;
        // TODO: 1024 enough?
        unsigned char* plain = (unsigned char*) malloc(1024);

        int verified = EVP_DecryptFinal_ex(context, plain, &plain_length);

        bool success = false;
        if(verified > 0)
            success = true;

        val keypair = val::object();
        keypair.set("plain", typed_memory_view(plain_length, plain));
        keypair.set("success", success);
        return keypair;
    }

    static void set_tag(size_t context_offset, size_t tag_offset)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*)context_offset;
        unsigned char* tag = (unsigned char*)tag_offset;

        EVP_CIPHER_CTX_ctrl(context, EVP_CTRL_GCM_SET_TAG, TAG_LENGTH, tag);
    }

    static void context_free(size_t context_offset)
    {
        EVP_CIPHER_CTX* context = (EVP_CIPHER_CTX*)context_offset;

        EVP_CIPHER_CTX_free(context);
    }
};

EMSCRIPTEN_BINDINGS(AES)
{
    class_<AES>("AES")
        .class_function("encrypt_context", &AES::encrypt_context)
        .class_function("encrypt", &AES::encrypt)
        .class_function("encrypt_finalize", &AES::encrypt_finalize)
        .class_function("get_tag", &AES::get_tag)
        .class_function("decrypt_context", &AES::decrypt_context)
        .class_function("decrypt", &AES::decrypt)
        .class_function("decrypt_finalize", &AES::decrypt_finalize)
        .class_function("set_tag", &AES::set_tag)
        .class_function("context_free", &AES::context_free);
}
