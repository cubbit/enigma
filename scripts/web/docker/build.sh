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
./Configure purify no-asm no-bf no-camellia no-capieng no-cast no-cms no-des no-dh no-dsa no-ec no-ecdh no-ecdsa no-engine no-err no-hw no-idea no-jpake no-krb5 no-md2 no-md4 no-mdc2 no-rc2 no-rc4 no-rc5 no-ripemd no-rsa no-seed no-sock no-ssl2 no-ssl3 no-tlsext
(make depend || true)
make build_crypto
cd /src

emcc --bind -O3 -o /out/cubbit.js \
    /bindings/ed25519.cc /bindings/aes.cc /bindings/sha256.cc \
    ed25519/src/*.c \
    openssl/libcrypto.a \
    -Ied25519/src \
    -Iopenssl/include \
    -DED25519_NO_SEED \
    -s DEMANGLE_SUPPORT=1 -s EXPORT_NAME="cubbit" -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=web -s SINGLE_FILE=1 -s MODULARIZE=1 \
    -s INLINING_LIMIT=1
