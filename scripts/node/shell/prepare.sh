#!/bin/sh

set -e

git clone -b master --single-branch --depth 1 https://github.com/orlp/ed25519 ed25519

mkdir openssl
curl -s https://www.openssl.org/source/openssl-$OPENSSL_VERSION.tar.gz | tar -C openssl --strip-components=1 -xzf -

cd openssl
./Configure $OPENSSL_COMPILER shared no-asm no-bf no-camellia no-cast no-cms no-des no-dh no-ec no-ecdh no-ecdsa no-err no-idea no-md2 no-md4 no-mdc2 no-rc2 no-rc4 no-rc5 no-seed no-ssl3 $MACOS_DEPLOYMENT_VERSION
make depend
make build_crypto
