import {Duplex} from 'stream';

declare module Enigma
{
    namespace Random
    {
        function integer(bits: 8 | 16 | 24 | 32 | 40 | 48): number;
        function bytes(length: number): Buffer;
    }

    namespace KeyDerivation
    {
        enum HMACAlgorithm
        {
            SHA1,
            SHA256,
            SHA384,
            SHA512
        }

        interface PBKDF2Options
        {
            key_bytes?: number;
            salt_bytes?: number;
            iterations?: number;
            hmac_algorithm?: HMACAlgorithm;
        }

        function pbkdf2(message: string | Buffer, options?: KeyDerivation.PBKDF2Options): Promise<Buffer>;
        function pbkdf2_verify(message: string | Buffer, salted_key: Buffer, hmac_algorithm?: string): Promise<boolean>;
    }

    namespace Hash
    {
        interface Options
        {
            algorithm?: Algorithm;
            encoding?: Encoding;
        }

        enum Algorithm
        {
            SHA256
        }

        enum Encoding
        {
            BASE64,
            HEX
        }
    }

    class Hash
    {
        static digest(message: string | Buffer, options?: Hash.Options): string;
        static digest_file(file: string | File, options?: Hash.Options): Promise<string>;
        static stream(algorithm?: Hash.Algorithm): Duplex;
    }

    namespace ED25519
    {
        interface Keypair
        {
            public_key: Buffer;
            private_key: Buffer;
        }

        interface Options
        {
            keypair?: Keypair;
            seed?: Buffer;
        }
    }

    class ED25519
    {
        constructor(options?: ED25519.Options);
        static create_seed(): Buffer;
        static create_keypair(seed?: Buffer): ED25519.Keypair;
        static verify(message: string | Buffer, public_key: Buffer, signature: Buffer): boolean;
        sign(message: string | Buffer): Buffer;
        readonly keypair: ED25519.Keypair;
    }

    namespace RSA
    {
        interface Keypair
        {
            public_key: Buffer;
            private_key: Buffer;
        }

        interface KeypairOptions
        {
            size?: number;
            exponent?: number;
        }

        interface Options extends KeypairOptions
        {
            keypair?: Keypair;
        }
    }

    class RSA
    {
        constructor(options?: RSA.Options);
        static create_keypair(options?: RSA.KeypairOptions): RSA.Keypair;
        static encrypt(message: string | Buffer, public_key: Buffer): Buffer;
        decrypt(encrypted_message: Buffer): Buffer;
        readonly keypair: RSA.Keypair;
    }

    namespace Attorney
    {
        interface Options
        {
            encoding?: Encoding;
        }

        interface Contract
        {
            attributes: object;
            signature: string;
        }

        enum Encoding
        {
            BASE64,
            HEX
        }
    }

    class Attorney
    {
        static redact(attributes: object, signer: ED25519, options?: Attorney.Options): Attorney.Contract;
        static verify(contract: Attorney.Contract, public_key: Buffer, options?: Attorney.Options): boolean;
    }
}

export default Enigma
