import Enigma from '../../../src';

describe('DiffieHellman', () =>
{
    let enigma: any;

    beforeAll(async () =>
    {
        await Enigma.Factory.init('../../build/wasm/');
        enigma = Enigma.Factory.module;
        console.log(enigma);
    });

    it.only('should initialize without throwing', () =>
    {
        const dh = new enigma.DiffieHellman();

        expect(() => dh.initialize()).not.toThrow();
    });

    it('should return public key', async () =>
    {
        const dh1 = new enigma.DiffieHellman();
        const dh2 = new enigma.DiffieHellman();

        dh1.initialize();
        dh2.initialize();

        const pk: Buffer = dh1.get_public_key();

        expect(pk.byteLength).toBe(65);
    });

    it('should derive secrete', async () =>
    {
        const dh1 = new enigma.DiffieHellman();
        const dh2 = new enigma.DiffieHellman();

        dh1.initialize();
        dh2.initialize();

        const pk1 = dh1.get_public_key();
        const pk2 = dh2.get_public_key();

        const secret1:Buffer = await dh1.derive_secret(pk2);
        const secret2: Buffer = await dh2.derive_secret(pk1);

        expect(secret1.toString() === secret2.toString()).toBe(true);
    });
});
