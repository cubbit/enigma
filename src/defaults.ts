const defaults = {
    buffer_encoding: 'BASE64',
    hash: {
        algorithm: 'SHA256',
        encoding: 'BASE64'
    },
    key_derivation: {
        salt_bytes: 128,
        iterations: 872791,
        hmac_algorithm: 'SHA256',
        key_bytes: 64
    },
    aes: {
        key_bits: 256,
        algorithm: 'GCM',
        iv_bytes: 16,
        tag_bytes: 16
    },
    rsa: {
        key_bits: 2048,
        exponent: 65537
    },
};

export {defaults};
