#include <napi.h>

namespace bindings_ed25519
{
    Napi::Value create_seed(const Napi::CallbackInfo &info);
    Napi::Value create_keypair(const Napi::CallbackInfo &info);
    Napi::Value sign(const Napi::CallbackInfo &info);
    Napi::Value verify(const Napi::CallbackInfo &info);
}

namespace bindings_rsa
{
    Napi::Value create_keypair(const Napi::CallbackInfo &info);
}

Napi::Object init(Napi::Env env, Napi::Object exports)
{
    exports.Set(Napi::String::New(env, "ed25519_create_seed"), Napi::Function::New(env, bindings_ed25519::create_seed));
    exports.Set(Napi::String::New(env, "ed25519_create_keypair"), Napi::Function::New(env, bindings_ed25519::create_keypair));
    exports.Set(Napi::String::New(env, "ed25519_sign"), Napi::Function::New(env, bindings_ed25519::sign));
    exports.Set(Napi::String::New(env, "ed25519_verify"), Napi::Function::New(env, bindings_ed25519::verify));

    exports.Set(Napi::String::New(env, "rsa_create_keypair"), Napi::Function::New(env, bindings_rsa::create_keypair));

    return exports;
}

NODE_API_MODULE(addon, init)
