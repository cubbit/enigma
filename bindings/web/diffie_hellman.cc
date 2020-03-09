#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include <sstream>
#include <iostream>
#include <iomanip>

#include <openssl/evp.h>
#include <openssl/ec.h>
#include <openssl/pem.h>
#include <openssl/rand.h>
#include <openssl/err.h>
#include <openssl/sha.h>

using namespace emscripten;

#define ERROR_NULL(VAR, FUN, ERR_VAR, MESSAGE)                 \
    if((ERR_VAR).empty())                                      \
    {                                                          \
        VAR = FUN;                                             \
        if(VAR == nullptr)                                     \
            ERR_VAR = #MESSAGE;                                \
    }

#define ERROR_EVP(FUN, ERR_VAR, MESSAGE)                       \
    {                                                          \
        if((ERR_VAR).empty())                                  \
        {                                                      \
            size_t a = (size_t)FUN;                            \
            if(a != 1)                                         \
                ERR_VAR = #MESSAGE;                            \
        }                                                      \
    }

class DiffieHellman
{
  private:
    
    EVP_PKEY* _private_key;

  public:

    DiffieHellman() : _private_key(nullptr)
    {}

    void free()
    {
        EVP_PKEY_free(this->_private_key);
    }

    inline val _error_js(std::string error_message)
    {
        auto error = val::object();
        error.set("error", error_message);
        return error;
    }

    inline val _value_js(std::string value = "")
    {
        auto value_js = val::object();
        
        if(value == "")
            value_js.set("value", val::undefined());
        else
            value_js.set("value", value);

        return value_js;
    }

    val initialize()
    {
        std::string error_message;

        EVP_PKEY_CTX* parameters_context = nullptr;
        EVP_PKEY_CTX* key_generation_context = nullptr;
        EVP_PKEY* params = nullptr;
        this->_private_key = nullptr;

        ERROR_NULL(parameters_context, EVP_PKEY_CTX_new_id(EVP_PKEY_EC, nullptr), error_message, "No context for parameter generation detected");

        ERROR_EVP(EVP_PKEY_paramgen_init(parameters_context), error_message, "Unable to initialize parameters generation");

        ERROR_EVP(EVP_PKEY_CTX_set_ec_paramgen_curve_nid(parameters_context, NID_X9_62_prime256v1), error_message, "Unable to set the curve for parameters generation");
        ERROR_EVP(EVP_PKEY_CTX_set_ec_param_enc(parameters_context, OPENSSL_EC_NAMED_CURVE), error_message, "Unable to set the curve for parameters generation");
        ERROR_EVP(EVP_PKEY_paramgen(parameters_context, &params), error_message, "Unable to generate parameters");

        ERROR_NULL(key_generation_context, EVP_PKEY_CTX_new(params, nullptr), error_message, "Unable to create context for key generation");
        ERROR_EVP(EVP_PKEY_keygen_init(key_generation_context), error_message, "Unable to init context for key generation");
        ERROR_EVP(EVP_PKEY_keygen(key_generation_context, &this->_private_key), error_message, "Unable to generate private key");

        EVP_PKEY_CTX_free(parameters_context);
        EVP_PKEY_CTX_free(key_generation_context);
        EVP_PKEY_free(params);

        if(!error_message.empty())
            return this->_error_js(error_message);
        
        return this->_value_js();
    }

    val get_public_key()
    {
        if(this->_private_key == nullptr)
            return this->_error_js("not initialized");

        std::string public_key_str;
        std::string	error_message;

        {
            BIO* bio_out;
            BUF_MEM* bio_out_buffer = nullptr;
            bio_out = BIO_new(BIO_s_mem());

            ERROR_EVP(PEM_write_bio_PUBKEY(bio_out, this->_private_key), error_message, "Unable to write public key to memory");

            if(error_message.empty())
            {
                BIO_get_mem_ptr(bio_out, &bio_out_buffer);

                public_key_str.resize(bio_out_buffer->length);

                memcpy((void*)public_key_str.data(), bio_out_buffer->data, bio_out_buffer->length);
            }

            BIO_free_all(bio_out);
        }

        if(!error_message.empty())
            return this->_error_js(error_message);

        return this->_value_js(public_key_str);
    }

    std::string uint8_to_hex_string(std::vector<uint8_t> v)
    {
        std::ostringstream ss;
        ss << std::hex << std::setfill( '0' );
        std::for_each( v.cbegin(), v.cend(), [&]( int c ) { ss << std::setw( 2 ) << c; } );
        return ss.str();
    }

    val derive_secret(std::string endpoint_public_key)
    {
        if(this->_private_key == nullptr)
            return this->_error_js("not initialized");

        size_t secret_length;
        std::vector<uint8_t> secret_vec;
        std::string	error_message;

        EVP_PKEY* endpoint_public_key_evp = nullptr;
        EVP_PKEY_CTX* derivation_context = nullptr;
        
        {
            BIO* bio;
            BUF_MEM* bio_buffer;

            bio = BIO_new(BIO_s_mem());
            bio_buffer = BUF_MEM_new();

            BUF_MEM_grow(bio_buffer, endpoint_public_key.size());

            memcpy(bio_buffer->data, (unsigned char*) endpoint_public_key.data(), endpoint_public_key.size());

            BIO_set_mem_buf(bio, bio_buffer, BIO_NOCLOSE);

            ERROR_NULL(endpoint_public_key_evp, PEM_read_bio_PUBKEY(bio, nullptr, nullptr, nullptr), error_message, "Unable to write public key to memory");

            BIO_free_all(bio);
            BUF_MEM_free(bio_buffer);

            if(!error_message.empty())
                return this->_error_js(error_message);
        }

        ERROR_NULL(derivation_context, EVP_PKEY_CTX_new(this->_private_key, nullptr), error_message, "Unable to create shared secret context");

        ERROR_EVP(EVP_PKEY_derive_init(derivation_context), error_message, "Unable to initialize shared secret context");
        ERROR_EVP(EVP_PKEY_derive_set_peer(derivation_context, endpoint_public_key_evp), error_message, "Unable to set peer public key");

        ERROR_EVP(EVP_PKEY_derive(derivation_context, nullptr, &secret_length), error_message, "Error while trying to derive secret length");

        if(error_message.empty())
            secret_vec.resize(secret_length);
        
        ERROR_EVP(EVP_PKEY_derive(derivation_context, (unsigned char*) secret_vec.data(), &secret_length), error_message, "Could not dervive the shared secret");

        EVP_PKEY_CTX_free(derivation_context);
        EVP_PKEY_free(endpoint_public_key_evp);

        if(!error_message.empty())
            return this->_error_js(error_message);

        return this->_value_js(this->uint8_to_hex_string(secret_vec));
    }
};

EMSCRIPTEN_BINDINGS(DiffieHellman)
{
    class_<DiffieHellman>("DiffieHellman")
        .constructor()
        .function("free", &DiffieHellman::free)
        .function("initialize", &DiffieHellman::initialize)
        .function("get_public_key", &DiffieHellman::get_public_key)
        .function("derive_secret", &DiffieHellman::derive_secret);
}