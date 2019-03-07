declare namespace Enigma
{
    namespace Random {
        function integer(bits: 8 | 16 | 24 | 32 | 40 | 48): number;
        function bytes(length: number): Buffer;
    }

    namespace KeyDerivation {
        enum HMACAlgorithm {
            SHA1,
            SHA256,
            SHA384,
            SHA512
        }
        interface PBKDF2Options {
            key_bytes?: number;
            salt_bytes?: number;
            iterations?: number;
            hmac_algorithm?: HMACAlgorithm;
        }

        function pbkdf2(message: string | Buffer, options?: KeyDerivation.PBKDF2Options): Promise<Buffer>;
        function pbkdf2_verify(message: string | Buffer, salted_key: Buffer, hmac_algorithm?: string): Promise<boolean>;
    }
}
