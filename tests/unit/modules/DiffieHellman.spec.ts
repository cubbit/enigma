import Enigma from '../../../src';

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
        await expect(dh.derive_secret(Buffer.alloc(0))).rejects.toThrow();
    });

    it('should return public key', async () =>
    {
        const dh1 = new Enigma.DiffieHellman();
        const dh2 = new Enigma.DiffieHellman();

        dh1.initialize();
        dh2.initialize();

        const pk: Buffer = dh1.get_public_key();

        expect(pk.byteLength).toBe(65);
    });

    it('should derive secrete', async () =>
    {
        const dh1 = new Enigma.DiffieHellman();
        const dh2 = new Enigma.DiffieHellman();

        dh1.initialize();
        dh2.initialize();

        const pk1 = dh1.get_public_key();
        const pk2 = dh2.get_public_key();

        const secret1: Buffer = await dh1.derive_secret(pk2);
        const secret2: Buffer = await dh2.derive_secret(pk1);

        expect(secret1.toString() === secret2.toString()).toBe(true);
    });
});
