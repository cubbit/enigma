#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <openssl/evp.h>
#include <openssl/ec.h>
#include <openssl/pem.h>
#include <openssl/rand.h>
#include <openssl/err.h>
#include <openssl/sha.h>

using namespace emscripten;

#define ERROR( TEST)                                                                   \
    if(error_return.empty() && (TEST))                                                  \
    {                                                                                    \
        error_return = #TEST;                                                               \
    }

#define ERRORC(TEST)                                                                  \
    {                                                                                        \
        size_t a = (size_t)TEST;                                                             \
        if(error_return.empty() && a != 1)                                                    \
        {                                                                                            \
            error_return = #TEST;   \
        }                                                                                    \
    }

class DiffieHellman
{
  private:
    
    EVP_PKEY* _private_key;

  public:

    void free()//_seed(size_t seed_offset, size_t seed_length)
    {
        EVP_PKEY_free(this->_private_key);
    }

    std::string initialize()//_seed(size_t seed_offset, size_t seed_length)
    {
        std::string error_return;

        EVP_PKEY_CTX* parameters_context = NULL;
        EVP_PKEY_CTX* key_generation_context = NULL;
        
        EVP_PKEY* params = NULL;

        parameters_context = EVP_PKEY_CTX_new_id(EVP_PKEY_EC, nullptr);
        ERROR(parameters_context == nullptr);

        ERRORC(EVP_PKEY_paramgen_init(parameters_context));

        ERRORC(EVP_PKEY_CTX_set_ec_paramgen_curve_nid(parameters_context, NID_X9_62_prime256v1));

        ERRORC(EVP_PKEY_paramgen(parameters_context, &params));

        if(!error_return.empty())
        {
            EVP_PKEY_CTX_free(parameters_context);
            return error_return;
        }

        key_generation_context = EVP_PKEY_CTX_new(params, nullptr);
        ERROR(key_generation_context == nullptr);

        if(!error_return.empty())
        {
            EVP_PKEY_CTX_free(parameters_context);
            return error_return;
        }

        ERRORC(EVP_PKEY_keygen_init(key_generation_context));

        ERRORC(EVP_PKEY_keygen(key_generation_context, &this->_private_key));

        EVP_PKEY_CTX_free(parameters_context);
        EVP_PKEY_CTX_free(key_generation_context);

        if(!error_return.empty())
            return error_return;

        return "ok"; //val(typed_memory_view(private_key_string.size(), private_key_string.data()));
    }

    std::string get_public_key()
    {
        std::string public_key_string;
        std::string	error_return;

        if(!error_return.empty())
            return error_return;
            
        {
            BIO* in_memory_buffer;
            BUF_MEM* in_memory_buffer_content_ptr;
            in_memory_buffer = BIO_new(BIO_s_mem());

            ERRORC(PEM_write_bio_PUBKEY(in_memory_buffer, this->_private_key))

            if(!error_return.empty())
            {
                BIO_free(in_memory_buffer);
                return error_return;
            }

            BIO_get_mem_ptr(in_memory_buffer, &in_memory_buffer_content_ptr);

            public_key_string.resize(in_memory_buffer_content_ptr->length);

            memcpy((void*)public_key_string.data(), in_memory_buffer_content_ptr->data, in_memory_buffer_content_ptr->length);

            BIO_free(in_memory_buffer);
            // BUF_MEM_free(in_memory_buffer_content_ptr);
        }

        return public_key_string; // val(typed_memory_view(public_key_string.size(), public_key_string.data()));
    }

    std::string get_private()
    {
        std::string private_key_string;
        std::string	error_return;
        EC_KEY* private_key_ec;
        uint8_t* private_key_encoded = nullptr;

        BIO* in_memory_buffer;
        BUF_MEM* in_memory_buffer_content_ptr;
        in_memory_buffer = BIO_new(BIO_s_mem());

        ERRORC(PEM_write_bio_PrivateKey(in_memory_buffer, this->_private_key, NULL, NULL, NULL, NULL, NULL));

        if(!error_return.empty())
        {
            BIO_free(in_memory_buffer);
            return error_return;
        }

        BIO_get_mem_ptr(in_memory_buffer, &in_memory_buffer_content_ptr);

        private_key_string.resize(in_memory_buffer_content_ptr->length);

        memcpy((void*)&private_key_string[0], in_memory_buffer_content_ptr->data, in_memory_buffer_content_ptr->length);

        BIO_free(in_memory_buffer);

        return private_key_string;
    }

    void set_private(std::string private_key)
    {
        BIO* bio;
        BUF_MEM* buf_mem;

        bio = BIO_new(BIO_s_mem());
        buf_mem = BUF_MEM_new();

        BUF_MEM_grow(buf_mem, private_key.size());

        memcpy(buf_mem->data, (unsigned char*) private_key.data(), private_key.size());

        BIO_set_mem_buf(bio, buf_mem, BIO_NOCLOSE);

        this->_private_key = PEM_read_bio_PrivateKey(bio, nullptr, nullptr, nullptr);
    }
    
    std::string derive_secret(std::string peer_public_key)
    {
        std::string secret_string;
        // std::vector<uint8_t> secret_string;
        std::vector<uint8_t> secret_digest_string;

        size_t secret_length;

        std::string	error_return;

        EVP_PKEY_CTX* shared_secret_context;
        
        BIO* bio_public;
        BUF_MEM* buf_mem_public;
        EVP_PKEY* peer_public_key_evp;
        
        if(!error_return.empty())
            return error_return;

        {
            BIO* bio;
            BUF_MEM* buf_mem;

            bio = BIO_new(BIO_s_mem());
            buf_mem = BUF_MEM_new();

            BUF_MEM_grow(buf_mem, peer_public_key.size());

            memcpy(buf_mem->data, (unsigned char*) peer_public_key.data(), peer_public_key.size());

            BIO_set_mem_buf(bio, buf_mem, BIO_NOCLOSE);

            peer_public_key_evp = PEM_read_bio_PUBKEY(bio, nullptr, nullptr, nullptr);
            ERROR(peer_public_key_evp == NULL);

            if(!error_return.empty())
            {
                BIO_free(bio);
                return error_return;
            }

            bio_public = bio;
            buf_mem_public = buf_mem;
        }

        shared_secret_context = EVP_PKEY_CTX_new(this->_private_key, nullptr);

        ERROR(shared_secret_context == nullptr);

        ERRORC(EVP_PKEY_derive_init(shared_secret_context));
        ERRORC(EVP_PKEY_derive_set_peer(shared_secret_context, peer_public_key_evp));

        ERRORC(EVP_PKEY_derive(shared_secret_context, nullptr, &secret_length));

        if(!error_return.empty())
        {
            BIO_free(bio_public);
            EVP_PKEY_CTX_free(shared_secret_context);
            return error_return;
        }

        secret_string.resize(secret_length);
        
        ERRORC(EVP_PKEY_derive(shared_secret_context, (unsigned char*) secret_string.data(), &secret_length))

        BIO_free(bio_public);
        EVP_PKEY_CTX_free(shared_secret_context);

        if(!error_return.empty())
            return error_return;

        return secret_string;
        // return val(typed_memory_view(secret_string.size(), (unsigned char*) secret_string.data()));
    }
    
};

EMSCRIPTEN_BINDINGS(DiffieHellman)
{
    class_<DiffieHellman>("DiffieHellman")
        .constructor()
        .function("free", &DiffieHellman::free)
        .function("initialize", &DiffieHellman::initialize)
        .function("get_public_key", &DiffieHellman::get_public_key)
        .function("get_private", &DiffieHellman::get_private)
        .function("set_private", &DiffieHellman::set_private)
        .function("derive_secret", &DiffieHellman::derive_secret);
        // .class_function("generate_private_key_seed", &DiffieHellman::generate_private_key_seed)
        // .class_function("get_public_key", &DiffieHellman::get_public_key)
        // .class_function("derive_secret", &DiffieHellman::derive_secret);
}