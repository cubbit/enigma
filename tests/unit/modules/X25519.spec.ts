import Enigma from '../../../src';

// tslint:disable-next-line:no-var-requires
const X25519_key_exchange = require('../../../src/common/x25519.js');

describe('X25519', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    beforeEach(() => 
    {
        expect.hasAssertions();
    });

    it('should generate a random key', () =>
    {
        expect(Enigma.X25519.create_key()).toBeDefined();
    });

    it('should generate a key from a given ED25519 keypair', () =>
    {
        const seed = Enigma.ED25519.create_seed();
        expect(Enigma.X25519.create_key(seed)).toBeDefined();
    });

    it('should use a given key', async () =>
    {
        expect.assertions(1);
        const key = Enigma.X25519.create_key();

        const x25519 = new Enigma.X25519();
        await x25519.init({key});

        expect(x25519.key).toEqual(key);
    });

    it('should use a given seed', async () =>
    {
        expect.assertions(1);
        const seed = Enigma.ED25519.create_seed();
        const key = Enigma.X25519.create_key(seed);

        const x25519 = new Enigma.X25519();
        await x25519.init({seed});

        expect(x25519.key).toEqual(key);
    });

    it('should return the public_key', async () =>
    {
        expect.assertions(1);

        const seed = Enigma.ED25519.create_seed();
        const key = Enigma.X25519.create_key(seed);
        
        const x25519 = new Enigma.X25519();
        await x25519.init({seed});

        expect(x25519.public_key).toEqual(Buffer.from(X25519_key_exchange.getPublic(key)));
    });

    it('should encrypt and decrypt correctly', async () =>
    {
        expect.assertions(2);

        const message = 'To be encrypted';

        const x25519_1 = new Enigma.X25519();
        await x25519_1.init();

        const x25519_2 = new Enigma.X25519();
        await x25519_2.init();

        const encrypted = await x25519_1.encrypt(message);
        expect((await x25519_1.decrypt(encrypted)).toString()).toBe(message);
        await expect(x25519_2.decrypt(encrypted)).rejects.toThrow();
    });

});
