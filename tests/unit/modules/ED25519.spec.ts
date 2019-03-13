import Enigma from '../../../src';

describe('ED25519', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should generate a random seed', () =>
    {
        const seed = Enigma.ED25519.create_seed();
        expect(seed.length).toBe(32);
    });

    it('should generate a random keypair', () =>
    {
        const keypair = Enigma.ED25519.create_keypair();
        expect(keypair.private_key.length).toBe(64);
        expect(keypair.public_key.length).toBe(32);
    });

    it('should generate same keypair form same seed', () =>
    {
        const seed = Buffer.from('dcuKlYOyAS1yhBcSb17dMxcKinao6SkCKXa4QgiaYrw=', 'base64');
        const keypair_1 = Enigma.ED25519.create_keypair(seed);
        const keypair_2 = Enigma.ED25519.create_keypair(seed);
        expect(keypair_1).toEqual(keypair_2);
    });

    it('should throw generating a keypair using a wrong size seed', () =>
    {
        const seed = Buffer.alloc(0);
        expect(() => Enigma.ED25519.create_keypair(seed)).toThrowError();
    });

    it('should use a given seed', () =>
    {
        const seed = Buffer.from('dcuKlYOyAS1yhBcSb17dMxcKinao6SkCKXa4QgiaYrw=', 'base64');
        const keypair = Enigma.ED25519.create_keypair(seed);
        const ecc = new Enigma.ED25519({seed});
        expect(ecc.keypair).toEqual(keypair);
    });

    it('should use a given keypair', () =>
    {
        const keypair = Enigma.ED25519.create_keypair();
        const ecc = new Enigma.ED25519({keypair});
        expect(ecc.keypair).toEqual(keypair);
    });

    it('should sign in the same way using string or Buffer', () =>
    {
        const message = 'To be signed';
        const ecc = new Enigma.ED25519();
        expect(ecc.sign(message)).toEqual(ecc.sign(Buffer.from(message)));
    });

    it('should verify in the same way using string or Buffer', () =>
    {
        const message = 'To be signed';
        const ecc = new Enigma.ED25519();
        const signature = ecc.sign(message);
        expect(Enigma.ED25519.verify(message, ecc.keypair.public_key, signature)).toBe(Enigma.ED25519.verify(Buffer.from(message), ecc.keypair.public_key, signature));
    });

    it('should sign and verify correctly', () =>
    {
        const message = 'To be signed';
        const ecc_1 = new Enigma.ED25519();
        const ecc_2 = new Enigma.ED25519();
        const signature = ecc_1.sign(message);
        expect(Enigma.ED25519.verify(message, ecc_1.keypair.public_key, signature)).toBe(true);
        expect(Enigma.ED25519.verify(message, ecc_2.keypair.public_key, signature)).toBe(false);
    });

    it('should throw signing using a wrong size keypair', () =>
    {
        const message = 'To be signed';

        const ecc_1 = new Enigma.ED25519();
        ecc_1.keypair.public_key = Buffer.alloc(0);
        expect(() => ecc_1.sign(message)).toThrowError();

        const ecc_2 = new Enigma.ED25519();
        ecc_2.keypair.private_key = Buffer.alloc(0);
        expect(() => ecc_2.sign(message)).toThrowError();
    });

    it('should throw verifying a wrong size signature or using a wrong size public_key', () =>
    {
        const message = 'To be signed';

        const ecc = new Enigma.ED25519();
        const signature = ecc.sign(message);
        expect(() => Enigma.ED25519.verify(message, ecc.keypair.public_key, Buffer.alloc(0))).toThrowError();
        expect(() => Enigma.ED25519.verify(message, Buffer.alloc(0), signature)).toThrowError();
    });
});
