set -e

source ~/programs/emsdk/emsdk_env.sh

BUILD_PATH="/home/princio/Works/Cubbit/enigma/build/wasm";
DEPS_PATH="/home/princio/Works/Cubbit/enigma/deps/local";
SRC_PATH="/home/princio/Works/Cubbit/enigma/bindings/web";

mkdir -p "$BUILD_PATH";
mkdir -p "$DEPS_PATH";

cd "$DEPS_PATH"
if [[ ! -d ./ed25519 ]]; then
    git clone -b master --single-branch --depth 1 https://github.com/orlp/ed25519 ed25519
fi

cd "$DEPS_PATH"
if [[ ! -d ./openssl ]]; then
    mkdir openssl
    curl -s https://www.openssl.org/source/openssl-1.0.2q.tar.gz | tar -C openssl --strip-components=1 -xzf -
    cd openssl
    export CC=emcc
    export CXX=emcc
    export LINK=${CXX}
    ./Configure purify no-asm no-capieng no-err no-hw no-jpake no-krb5 no-md2 no-rc5 no-sock no-ssl2 no-ssl3 no-tlsext
    (make depend || true)
    make build_crypto
fi

# emcc --bind -O3 -o "$BUILD_PATH"/enigma.web.js \
#     "$SRC_PATH"/ed25519.cc "$SRC_PATH"/aes.cc "$SRC_PATH"/sha256.cc "$SRC_PATH"/diffie_hellman.cc \
#     "$DEPS_PATH"/ed25519/src/*.c \
#     "$DEPS_PATH"/openssl/libcrypto.a \
#     -I"$DEPS_PATH"/ed25519/src \
#     -I"$DEPS_PATH"/openssl/include \
#     -DED25519_NO_SEED \
#     -s DEMANGLE_SUPPORT=1 \
#     -s EXPORT_NAME="enigma" \
#     -s ALLOW_MEMORY_GROWTH=1 \
#     -s ENVIRONMENT=web \
#     -s SINGLE_FILE=1 \
#     -s MODULARIZE=1 \
#     -s ASSERTIONS=1 \
#     -fsanitize=undefined \
#     -g \
#     -fno-omit-frame-pointer \
#     -s SAFE_HEAP=1 \
#     -s INLINING_LIMIT=1

# emcc --bind -O3 -o "$BUILD_PATH"/enigma.worker.js \
#     "$SRC_PATH"/ed25519.cc "$SRC_PATH"/aes.cc "$SRC_PATH"/sha256.cc "$SRC_PATH"/diffie_hellman.cc \
#     "$DEPS_PATH"/ed25519/src/*.c \
#     "$DEPS_PATH"/openssl/libcrypto.a \
#     -I"$DEPS_PATH"/ed25519/src \
#     -I"$DEPS_PATH"/openssl/include \
#     -DED25519_NO_SEED \
#     -s DEMANGLE_SUPPORT=1 \
#     -s EXPORT_NAME="enigma" -s ALLOW_MEMORY_GROWTH=1 -s ENVIRONMENT=worker -s SINGLE_FILE=1 -s MODULARIZE=1 \
#     -s INLINING_LIMIT=1
