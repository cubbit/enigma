set -e

mkdir -p /src
cd /src

git clone -b master --single-branch --depth 1 https://github.com/orlp/ed25519 ed25519

mkdir openssl
curl -s https://www.openssl.org/source/openssl-$OPENSSL_VERSION.tar.gz | tar -C openssl --strip-components=1 -xzf -
cd openssl
export CC=emcc
export CXX=emcc
export LINK=${CXX}
./Configure purify no-asm no-capieng no-err no-hw no-jpake no-krb5 no-md2 no-rc5 no-sock no-ssl2 no-ssl3 no-tlsext
(make depend || true)
make build_crypto
cd /src

emcc --bind -O3 -o /out/enigma.web.js \
    /bindings/ed25519.cc /bindings/aes.cc /bindings/sha256.cc /bindings/diffie_hellman.cc \
    ed25519/src/*.c \
    openssl/libcrypto.a \
    -Ied25519/src \
    -Iopenssl/include \
    -DED25519_NO_SEED \
    -s DEMANGLE_SUPPORT=1 -s EXPORT_NAME="enigma" -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web -s SINGLE_FILE=1 -s MODULARIZE=1 \
    -s INLINING_LIMIT=1

emcc --bind -O3 -o /out/enigma.worker.js \
    /bindings/ed25519.cc /bindings/aes.cc /bindings/sha256.cc /bindings/diffie_hellman.cc \
    ed25519/src/*.c \
    openssl/libcrypto.a \
    -Ied25519/src \
    -Iopenssl/include \
    -DED25519_NO_SEED \
    -s DEMANGLE_SUPPORT=1 -s EXPORT_NAME="enigma" -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=worker -s SINGLE_FILE=1 -s MODULARIZE=1 \
    -s INLINING_LIMIT=1
