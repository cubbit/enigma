import {defaults} from '../../defaults';
import {Random} from './Random';

export namespace KeyDerivation
{
    export enum HMACAlgorithm
    {
        SHA1 = 'SHA-1',
        SHA256 = 'SHA-256',
        SHA384 = 'SHA-384',
        SHA512 = 'SHA-512'
    }

    export interface PBKDF2Options
    {
        key_bytes?: number;
        salt_bytes?: number;
        salt?: Buffer;
        iterations?: number;
        hmac_algorithm?: HMACAlgorithm;
    }

    /**
     * Perform PBKDF2 key derivation on a message
     * @param message Message from which derive a key
     * @param options PBKDF2 options
     * @returns Asynchronously a buffer shaped like this:
     * +-------------+------------+------+-------------+
     * |  32 bit BE  | 32 bit BE  |      |             |
     * +-------------+------------+------+-------------+
     * | Salt length | Iterations | Salt | Derived key |
     * +-------------+------------+------+-------------+
     */
    export async function pbkdf2(message: string | Buffer, options?: KeyDerivation.PBKDF2Options): Promise<Buffer>
    {
        const salt_bytes = options?.salt?.length || options?.salt_bytes || defaults.key_derivation.salt_bytes;
        const iterations = options?.iterations || defaults.key_derivation.iterations;

        const buffer_max_length = 2 ** 32;
        if(iterations > buffer_max_length)
            throw new Error(`Iterations must be at most ${buffer_max_length}`);
        if(salt_bytes > buffer_max_length)
            throw new Error(`Salt length must be at most ${buffer_max_length}`);

        const key_bytes = options?.key_bytes || defaults.key_derivation.key_bytes;
        const key_bits = key_bytes * 8;
        const salt = options?.salt || Random.bytes(salt_bytes);
        // @ts-ignore
        const hmac_algorithm = options?.hmac_algorithm || KeyDerivation.HMACAlgorithm[defaults.key_derivation.hmac_algorithm as any] as KeyDerivation.HMACAlgorithm;

        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const crypto_key = await self.crypto.subtle.importKey('raw', message, 'PBKDF2', false, ['deriveBits']);
        const derived = Buffer.from(await self.crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: {name: hmac_algorithm}}, crypto_key, key_bits));

        const salted_key = Buffer.alloc(8 + salt.length + derived.length);

        salted_key.writeUInt32BE(salt.length, 0);
        salted_key.writeUInt32BE(iterations, 4);
        salt.copy(salted_key, 8);
        derived.copy(salted_key, salt.length + 8);

        return salted_key;
    }

    /**
     * Verify if a salted_key is derived from a message
     * @param message Message from which derive a key
     * @param salted_key The corresponding buffer shaped like this:
     * +-------------+------------+------+-------------+
     * |  32 bit BE  | 32 bit BE  |      |             |
     * +-------------+------------+------+-------------+
     * | Salt length | Iterations | Salt | Derived key |
     * +-------------+------------+------+-------------+
     * @param hmac_algorithm The HMAC algorithm used in the salting operation
     */
    export async function pbkdf2_verify(message: string | Buffer, salted_key: Buffer, hmac_algorithm?: KeyDerivation.HMACAlgorithm): Promise<boolean>
    {
        const salt_bytes = salted_key.readUInt32BE(0);
        const iterations = salted_key.readUInt32BE(4);
        const key_bytes = salted_key.length - salt_bytes - 8;
        const key_bits = key_bytes * 8;
        const salt = salted_key.slice(8, salt_bytes + 8);
        if(!hmac_algorithm)
            // @ts-ignore
            hmac_algorithm = KeyDerivation.HMACAlgorithm[defaults.key_derivation.hmac_algorithm as any] as KeyDerivation.HMACAlgorithm;

        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const key = salted_key.slice(salt_bytes + 8);

        const crypto_key = await self.crypto.subtle.importKey('raw', message, 'PBKDF2', false, ['deriveBits']);
        const derived = Buffer.from(await self.crypto.subtle.deriveBits({name: 'PBKDF2', salt, iterations, hash: {name: hmac_algorithm}}, crypto_key, key_bits));

        return derived.equals(key);
    }
}
