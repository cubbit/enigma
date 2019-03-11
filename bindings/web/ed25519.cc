#include <emscripten.h>
#include <emscripten/bind.h>
#include <emscripten/val.h>

#include "ed25519.h"

#define PUBLIC_KEY_LENGTH 32
#define PRIVATE_KEY_LENGTH 64
#define SIGNATURE_LENGTH 64

using namespace emscripten;

class ED25519
{
  public:
    static val create_keypair(size_t seed_offset, size_t seed_length)
    {
        // TODO: throw if wrong seed length?
        unsigned char* seed = (unsigned char*) seed_offset;

        unsigned char public_key[PUBLIC_KEY_LENGTH];
        unsigned char private_key[PRIVATE_KEY_LENGTH];
        ed25519_create_keypair(public_key, private_key, seed);

        val keypair = val::object();
        keypair.set("public_key", typed_memory_view(PUBLIC_KEY_LENGTH, public_key));
        keypair.set("private_key", typed_memory_view(PRIVATE_KEY_LENGTH, private_key));
        return keypair;
    }

    static val sign(size_t message_offset, size_t message_length, size_t public_key_offset, size_t public_key_length, size_t private_key_offset, size_t private_key_length)
    {
        // TODO: throw if wrong public key length?
        // TODO: throw if wrong private key length?

        unsigned char* message = (unsigned char*) message_offset;
        unsigned char* public_key = (unsigned char*) public_key_offset;
        unsigned char* private_key = (unsigned char*) private_key_offset;

        unsigned char signature[SIGNATURE_LENGTH];
        ed25519_sign(signature, message, message_length, public_key, private_key);

        return val(typed_memory_view(SIGNATURE_LENGTH, signature));
    }

    static val verify(size_t signature_offset, size_t signature_length, size_t message_offset, size_t message_length, size_t public_key_offset, size_t public_key_length)
    {
        // TODO: throw if wrong signature length?
        // TODO: throw if wrong public key length?

        unsigned char* signature = (unsigned char*) signature_offset;
        unsigned char* message = (unsigned char*) message_offset;
        unsigned char* public_key = (unsigned char*) public_key_offset;

        bool verified = ed25519_verify(signature, message, message_length, public_key);

        return val(verified);
    }
};

EMSCRIPTEN_BINDINGS(ED25519)
{
    class_<ED25519>("ED25519")
        .class_function("create_keypair", &ED25519::create_keypair)
        .class_function("sign", &ED25519::sign)
        .class_function("verify", &ED25519::verify);
}
