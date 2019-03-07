declare namespace Enigma
{
    namespace Random {
        function integer(bits: 8 | 16 | 24 | 32 | 40 | 48): number;
        function bytes(length: number): Buffer;
    }

    namespace KeyDerivation {
        interface PBKDF2Options {
            key_bytes?: number;
            salt_bytes?: number;
            iterations?: number;
            hmac_algorithm?: HMACAlgorithm;
        }
    }
    class KeyDerivation {
        public static pbkdf2(message: string | Buffer, options?: KeyDerivation.PBKDF2Options): Promise<Buffer>;
        public static pbkdf2_verify(message: string | Buffer, salted_key: Buffer, hmac_algorithm?: string): Promise<boolean>;
    }
    namespace KeyDerivation {
        enum HMACAlgorithm {
            SHA1,
            SHA256,
            SHA384,
            SHA512
        }
    }
}
