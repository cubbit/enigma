import Enigma from '../../../src';

import {createPublicKey} from 'crypto';

describe('DiffieHellman', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should initialize without throwing', () =>
    {
        const dh = new Enigma.DiffieHellman();

        expect(() => dh.initialize()).not.toThrow();
    });

    it('should throw if not initialized', async () =>
    {
        const dh = new Enigma.DiffieHellman();

        expect.assertions(2);

        expect(() => dh.get_public_key()).toThrow();

        await expect(dh.derive_secret('')).rejects.toThrow();
    });

    it('should throw if endpoint public key is not correct', async () =>
    {
        const dh = new Enigma.DiffieHellman();

        expect.assertions(3);

        dh.initialize();

        await expect(dh.derive_secret(dh.get_public_key().substr(20))).rejects.toThrow();
        await expect(dh.derive_secret('')).rejects.toThrow();
        await expect(dh.derive_secret('aisdfcbuishdb')).rejects.toThrow();
    });

    it('should return correct ec public key in spki pem format', async () =>
    {
        const dh1 = new Enigma.DiffieHellman();

        dh1.initialize();
        
        expect(() =>
        {
            createPublicKey({
                key: dh1.get_public_key().toString('utf-8'),
                format: 'pem',
            });
        }).not.toThrow();
    });

    it('should derive secrete', async () =>
    {
        const dh1 = new Enigma.DiffieHellman();
        const dh2 = new Enigma.DiffieHellman();

        dh1.initialize();
        dh2.initialize();

        const pk1 = dh1.get_public_key();
        const pk2 = dh2.get_public_key();

        const secret1 = await dh1.derive_secret(pk2);
        const secret2 = await dh2.derive_secret(pk1);

        expect(secret1 === secret2).toBe(true);
    });
});
