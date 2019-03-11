#include <memory>

#include <napi.h>

#include <openssl/rsa.h>
#include <openssl/bio.h>
#include <openssl/pem.h>

struct DeleteBIGNUM
{
    void operator()(BIGNUM* bn)
    {
        BN_free(bn);
    }
};

struct DeleteRSA
{
    void operator()(RSA* rsa)
    {
        RSA_free(rsa);
    }
};

struct DeleteBIO
{
    void operator()(BIO* bio)
    {
        BIO_vfree(bio);
    }
};

namespace bindings_rsa
{
    Napi::Value create_keypair(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        if(info.Length() != 2)
        {
            Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        if(!info[0].IsNumber() || !info[1].IsNumber())
        {
            Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        uint32_t modulus_bits = info[0].As<Napi::Number>().Uint32Value();
        uint32_t exponent = info[1].As<Napi::Number>().Uint32Value();

        std::unique_ptr<BIGNUM, DeleteBIGNUM> e(BN_new());
        if(!e || !BN_set_word(e.get(), exponent))
        {
            Napi::TypeError::New(env, "Failed to prepare bignum exponent").ThrowAsJavaScriptException();
            return env.Null();
        }

        std::unique_ptr<RSA, DeleteRSA> rsa(RSA_new());
        if(!rsa || !RSA_generate_key_ex(rsa.get(), modulus_bits, e.get(), nullptr))
        {
            Napi::TypeError::New(env, "Failed to prepare RSA").ThrowAsJavaScriptException();
            return env.Null();
        }

        std::unique_ptr<BIO, DeleteBIO> private_bio(BIO_new(BIO_s_mem()));
        if(!private_bio || !PEM_write_bio_RSAPrivateKey(private_bio.get(), rsa.get(), nullptr, nullptr, 0, nullptr, nullptr))
        {
            Napi::TypeError::New(env, "Failed to prepare private PEM").ThrowAsJavaScriptException();
            return env.Null();
        }

        std::unique_ptr<BIO, DeleteBIO> public_bio(BIO_new(BIO_s_mem()));
        if(!public_bio || !PEM_write_bio_RSAPublicKey(public_bio.get(), rsa.get()))
        {
            Napi::TypeError::New(env, "Failed to prepare public PEM").ThrowAsJavaScriptException();
            return env.Null();
        }

        unsigned char* private_data;
        unsigned long private_length = BIO_get_mem_data(private_bio.get(), &private_data);
        unsigned char* public_data;
        unsigned long public_length = BIO_get_mem_data(public_bio.get(), &public_data);

        Napi::Object n_keypair = Napi::Object::New(env);
        n_keypair.Set("private_key", Napi::Buffer<unsigned char>::Copy(env, private_data, private_length));
        n_keypair.Set("public_key", Napi::Buffer<unsigned char>::Copy(env, public_data, public_length));
        return n_keypair;
    }
}
