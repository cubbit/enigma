git clone -b master --single-branch --depth 1 https://github.com/orlp/ed25519 ed25519

mkdir openssl
curl.exe -s https://www.openssl.org/source/openssl-%OPENSSL_VERSION%.tar.gz --output openssl.tar
tar -C openssl --strip-components=1 -xzf openssl.tar
del openssl.tar

cd openssl
perl Configure %OPENSSL_COMPILER% no-shared no-asm no-bf no-camellia no-cast no-cms no-des no-dh no-ec no-ecdh no-ecdsa no-err no-idea no-md2 no-md4 no-mdc2 no-rc2 no-rc4 no-rc5 no-seed no-ssl3

IF /I "%OPENSSL_COMPILER%"=="VC-WIN32" call ms\do_ms
IF /I "%OPENSSL_COMPILER%"=="VC-WIN64A" call ms\do_win64a

nmake -f ms\nt.mak
