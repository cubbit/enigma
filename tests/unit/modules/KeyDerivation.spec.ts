import * as child_process from 'child_process';
import * as crypto from 'crypto';
import * as sinon from 'sinon';

import Enigma from '../../../src';

const message = 'To be derived';

describe('KeyDerivation', () =>
{
    beforeAll(async () =>
    {
        jest.setTimeout(30000);
        await Enigma.init();
    });

    it('should derive a key', async () =>
    {
        expect.assertions(2);
        let salted_key = await Enigma.KeyDerivation.pbkdf2(message);
        expect(salted_key).toBeDefined();
        salted_key = await Enigma.KeyDerivation.pbkdf2(Buffer.from(message));
        expect(salted_key).toBeDefined();
    });

    it('should derive a key with given salt lenghts', async () =>
    {
        const salt_lengths = [64, 128, 256];
        expect.assertions(salt_lengths.length);
        for(const salt_bytes of salt_lengths)
        {
            const salted_key = await Enigma.KeyDerivation.pbkdf2(message, {salt_bytes});
            expect(salted_key.readUInt32BE(0)).toBe(salt_bytes);
        }
    });

    it('should derive a key with given iterations', async () =>
    {
        const iterations_array = [50000, 872791, 1500000];
        expect.assertions(iterations_array.length);
        for(const iterations of iterations_array)
        {
            const salted_key = await Enigma.KeyDerivation.pbkdf2(message, {iterations});
            expect(salted_key.readUInt32BE(4)).toBe(iterations);
        }
    });

    it('should derive a key with given key lenghts', async () =>
    {
        const key_lengths = [32, 64, 128];
        expect.assertions(key_lengths.length);
        for(const key_bytes of key_lengths)
        {
            const salted_key = await Enigma.KeyDerivation.pbkdf2(message, {key_bytes});
            const salt_bytes = salted_key.readUInt32BE(0);
            expect(salted_key.slice(8 + salt_bytes).length).toBe(key_bytes);
        }
    });

    it('should derive a key with given hmac algorithms', async () =>
    {
        const hmac_algorithms = [];
        for(const algorithm in Enigma.KeyDerivation.HMACAlgorithm)
        {
            if(!Enigma.KeyDerivation.HMACAlgorithm.hasOwnProperty(algorithm))
                continue;
            hmac_algorithms.push(Enigma.KeyDerivation.HMACAlgorithm[algorithm]);
        }

        expect.assertions(hmac_algorithms.length);
        for(const hmac_algorithm of hmac_algorithms)
        {
            const salted_key = await Enigma.KeyDerivation.pbkdf2(message, {hmac_algorithm});
            expect(salted_key).toBeDefined();
        }
    });

    it('should derive and verify successfully', async () =>
    {
        expect.assertions(5);

        const salted_key = await Enigma.KeyDerivation.pbkdf2(message, {hmac_algorithm: Enigma.KeyDerivation.HMACAlgorithm.SHA256});
        expect(await Enigma.KeyDerivation.pbkdf2_verify(message, salted_key)).toBe(true);
        expect(await Enigma.KeyDerivation.pbkdf2_verify(Buffer.from(message), salted_key)).toBe(true);
        expect(await Enigma.KeyDerivation.pbkdf2_verify(message, salted_key, Enigma.KeyDerivation.HMACAlgorithm.SHA1)).toBe(false);
        expect(await Enigma.KeyDerivation.pbkdf2_verify('', salted_key)).toBe(false);
        expect(await Enigma.KeyDerivation.pbkdf2_verify(message, salted_key.fill(0))).toBe(false);
    });

    it('should throw deriving with iterations out of bound', async () =>
    {
        expect.assertions(1);
        const iterations = 2 ** 32 + 1;
        await expect(Enigma.KeyDerivation.pbkdf2(message, {iterations})).rejects.toThrow();
    });

    it('should throw deriving with a salt length out of bound', async () =>
    {
        expect.assertions(1);
        const salt_bytes = 2 ** 32 + 1;
        await expect(Enigma.KeyDerivation.pbkdf2(message, {salt_bytes})).rejects.toThrow();
    });

    it('should throw deriving or verifying with a hmac algorithm not supported', async () =>
    {
        expect.assertions(2);
        const hmac_algorithm = 'none' as any;
        await expect(Enigma.KeyDerivation.pbkdf2(message, {hmac_algorithm})).rejects.toThrow();
        const salted_key = await Enigma.KeyDerivation.pbkdf2(message);
        await expect(Enigma.KeyDerivation.pbkdf2_verify(message, salted_key, hmac_algorithm)).rejects.toThrow();
    });

    it('should throw if crypto fails', async () =>
    {
        const sandbox = sinon.createSandbox();
        const stub = sandbox.stub(crypto, 'pbkdf2');
        stub.yields(new Error('Stub'));
        sandbox.stub(child_process, 'exec');

        expect.assertions(2);
        await expect(Enigma.KeyDerivation.pbkdf2(message)).rejects.toThrow();
        await expect(Enigma.KeyDerivation.pbkdf2_verify(message, Buffer.alloc(8, 0))).rejects.toThrow();
    });
});
