{
    'variables': {'module_root%': '<!(node -p \"process.cwd()\")'},
    'targets': [{
        'target_name': 'dependencies',
        'type': 'none',
        'hard_dependency': 1,
        'actions': [{
            'action_name': 'prepare_dependencies',
            'inputs': ['<(module_root)/scripts/node/dependencies.js'],
            'outputs': ['<(module_root)/dependencies'],
            'action': [
                'node', '<(module_root)/scripts/node/dependencies.js'
            ],
            'message': 'Prepare dependencies'
        }]
    }, {
        'target_name': 'enigma',
        'dependencies': [
            'dependencies'
        ],
        'sources': [
            'dependencies/ed25519/src/add_scalar.c',
            'dependencies/ed25519/src/fe.c',
            'dependencies/ed25519/src/ge.c',
            'dependencies/ed25519/src/key_exchange.c',
            'dependencies/ed25519/src/keypair.c',
            'dependencies/ed25519/src/sc.c',
            'dependencies/ed25519/src/seed.c',
            'dependencies/ed25519/src/sha512.c',
            'dependencies/ed25519/src/sign.c',
            'dependencies/ed25519/src/verify.c',

            'bindings/node/ed25519.cc',
            'bindings/node/rsa.cc',
            'bindings/node/init.cc'
        ],
        'include_dirs': [
            '<!@(node -p \"require(\'node-addon-api\').include\")',
            'dependencies/ed25519/src'
        ],
        'defines': [
            'NAPI_DISABLE_CPP_EXCEPTIONS'
        ],
        'conditions': [
            ['OS=="mac"', {
                'include_dirs': ['<(module_root)/dependencies/openssl/include'],
                'libraries': ['-Wl,<(module_root)/dependencies/openssl/libcrypto.a']
            }],
            ['OS=="linux"', {
                'include_dirs': ['<(module_root)/dependencies/openssl/include'],
                'libraries': ['-L<(module_root)/dependencies/openssl', '-l:libcrypto.a', '-static-libstdc++']
            }],
            ['OS=="win"', {
                'include_dirs': ['<(module_root)/dependencies/openssl/inc32'],
                'libraries': ['-l<(module_root)/dependencies/openssl/out32/libeay32.lib', '-llegacy_stdio_definitions.lib']
            }]
        ]
    }]
}
