#include <sstream>

#include <napi.h>

#include "ed25519.h"

#define SEED_LENGTH 32
#define PUBLIC_KEY_LENGTH 32
#define PRIVATE_KEY_LENGTH 64
#define SIGNATURE_LENGTH 64

namespace bindings_ed25519
{
    Napi::Value create_seed(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        if(info.Length() != 0)
        {
            Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        unsigned char seed[SEED_LENGTH];
        int code = ed25519_create_seed(seed);
        if(code != 0)
        {
            Napi::TypeError::New(env, "Failed to create seed").ThrowAsJavaScriptException();
            return env.Null();
        }


        return Napi::Buffer<unsigned char>::Copy(env, seed, SEED_LENGTH);;
    }

    Napi::Value create_keypair(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        if(info.Length() != 1)
        {
            Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        if(!info[0].IsBuffer())
        {
            Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        Napi::Buffer<unsigned char> n_seed = Napi::Buffer<unsigned char>(env, info[0]);

        if(n_seed.Length() != SEED_LENGTH)
        {
            std::ostringstream error;
            error << "Seed must be " << SEED_LENGTH << " bytes";
            Napi::TypeError::New(env, error.str()).ThrowAsJavaScriptException();
            return env.Null();
        }

        unsigned char* seed = n_seed.Data();

        unsigned char public_key[PUBLIC_KEY_LENGTH];
        unsigned char private_key[PRIVATE_KEY_LENGTH];
        ed25519_create_keypair(public_key, private_key, seed);

        Napi::Object n_keypair = Napi::Object::New(env);
        n_keypair.Set("public_key", Napi::Buffer<unsigned char>::Copy(env, public_key, PUBLIC_KEY_LENGTH));
        n_keypair.Set("private_key", Napi::Buffer<unsigned char>::Copy(env, private_key, PRIVATE_KEY_LENGTH));
        return n_keypair;
    }

    Napi::Value sign(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        if(info.Length() != 3)
        {
            Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        if(!info[0].IsBuffer() || !info[1].IsBuffer() || !info[2].IsBuffer())
        {
            Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        Napi::Buffer<unsigned char> n_message = Napi::Buffer<unsigned char>(env, info[0]);
        Napi::Buffer<unsigned char> n_private_key = Napi::Buffer<unsigned char>(env, info[1]);
        Napi::Buffer<unsigned char> n_public_key = Napi::Buffer<unsigned char>(env, info[2]);

        if(n_public_key.Length() != PUBLIC_KEY_LENGTH)
        {
            std::ostringstream error;
            error << "Public key must be " << PUBLIC_KEY_LENGTH << " bytes";
            Napi::TypeError::New(env, error.str()).ThrowAsJavaScriptException();
            return env.Null();
        }

        if(n_private_key.Length() != PRIVATE_KEY_LENGTH)
        {
            std::ostringstream error;
            error << "Private key must be " << PRIVATE_KEY_LENGTH << " bytes";
            Napi::TypeError::New(env, error.str()).ThrowAsJavaScriptException();
            return env.Null();
        }

        unsigned char* message = n_message.Data();
        unsigned char* public_key = n_public_key.Data();
        unsigned char* private_key = n_private_key.Data();

        unsigned char signature[SIGNATURE_LENGTH];
        ed25519_sign(signature, message, n_message.Length(), public_key, private_key);

        return Napi::Buffer<unsigned char>::Copy(env, signature, SIGNATURE_LENGTH);;
    }

    Napi::Value verify(const Napi::CallbackInfo &info)
    {
        Napi::Env env = info.Env();

        if(info.Length() != 3)
        {
            Napi::TypeError::New(env, "Wrong number of arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        if(!info[0].IsBuffer() || !info[1].IsBuffer() || !info[2].IsBuffer())
        {
            Napi::TypeError::New(env, "Wrong arguments").ThrowAsJavaScriptException();
            return env.Null();
        }

        Napi::Buffer<unsigned char> n_signature = Napi::Buffer<unsigned char>(env, info[0]);
        Napi::Buffer<unsigned char> n_message = Napi::Buffer<unsigned char>(env, info[1]);
        Napi::Buffer<unsigned char> n_public_key = Napi::Buffer<unsigned char>(env, info[2]);

        if(n_signature.Length() != SIGNATURE_LENGTH)
        {
            std::ostringstream error;
            error << "Signature must be " << SIGNATURE_LENGTH << " bytes";
            Napi::TypeError::New(env, error.str()).ThrowAsJavaScriptException();
            return env.Null();
        }

        if(n_public_key.Length() != PUBLIC_KEY_LENGTH)
        {
            std::ostringstream error;
            error << "Public key must be " << PUBLIC_KEY_LENGTH << " bytes";
            Napi::TypeError::New(env, error.str()).ThrowAsJavaScriptException();
            return env.Null();
        }

        unsigned char* signature = n_signature.Data();
        unsigned char* message = n_message.Data();
        unsigned char* public_key = n_public_key.Data();

        bool verified = ed25519_verify(signature, message, n_message.Length(), public_key);

        return Napi::Boolean::New(env, verified);;
    }
}
