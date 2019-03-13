import * as pem_jwk from 'pem-jwk';

import Enigma from '../../../src';

describe('RSA', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should generate a random keypair', async () =>
    {
        expect.assertions(2);
        const keypair = await Enigma.RSA.create_keypair();
        expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
        expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
    });

    it('should generate a keypair with given size', async () =>
    {
        const sizes = [1024, 2048, 4096];
        expect.assertions(4 * sizes.length);
        for(const size of sizes)
        {
            const keypair = await Enigma.RSA.create_keypair({size});
            expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
            expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
            const private_jwk = pem_jwk.pem2jwk(keypair.private_key.toString());
            const public_jwk = pem_jwk.pem2jwk(keypair.public_key.toString());
            expect(Buffer.from(private_jwk.n, 'base64').length * 8).toBe(size);
            expect(Buffer.from(public_jwk.n, 'base64').length * 8).toBe(size);
        }
    });

    it('should generate a keypair with given exponent', async () =>
    {
        const exponents = [32769, 65537, 131073];
        expect.assertions(4 * exponents.length);
        for(const exponent of exponents)
        {
            const keypair = await Enigma.RSA.create_keypair({exponent});
            expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
            expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
            const private_jwk = pem_jwk.pem2jwk(keypair.private_key.toString());
            const public_jwk = pem_jwk.pem2jwk(keypair.public_key.toString());
            expect(Buffer.from(private_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
            expect(Buffer.from(public_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
        }
    });

    it('should use a given size and exponent', async () =>
    {
        expect.assertions(6);
        const exponent = 65537;
        const size = 2048;
        const rsa = new Enigma.RSA();
        await rsa.init({size, exponent});
        expect(rsa.keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
        expect(rsa.keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
        const private_jwk = pem_jwk.pem2jwk(rsa.keypair.private_key.toString());
        const public_jwk = pem_jwk.pem2jwk(rsa.keypair.public_key.toString());
        expect(Buffer.from(private_jwk.n, 'base64').length * 8).toBe(size);
        expect(Buffer.from(public_jwk.n, 'base64').length * 8).toBe(size);
        expect(Buffer.from(private_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
        expect(Buffer.from(public_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
    });

    it('should use a given keypair', async () =>
    {
        expect.assertions(1);
        const keypair = await Enigma.RSA.create_keypair();
        const rsa = new Enigma.RSA();
        await rsa.init({keypair});
        expect(rsa.keypair).toEqual(keypair);
    });

    it('should encrypt and decrypt correctly', async () =>
    {
        expect.assertions(4);
        const message = 'To be encrypted';
        const rsa_1 = new Enigma.RSA();
        await rsa_1.init();
        const rsa_2 = new Enigma.RSA();
        await rsa_2.init();
        const encrypted_1 = await Enigma.RSA.encrypt(message, rsa_1.keypair.public_key);
        const encrypted_2 = await Enigma.RSA.encrypt(Buffer.from(message), rsa_1.keypair.public_key);
        expect(await rsa_1.decrypt(encrypted_1)).toEqual(Buffer.from(message));
        expect(await rsa_1.decrypt(encrypted_2)).toEqual(Buffer.from(message));
        await expect(rsa_2.decrypt(encrypted_1)).rejects.toThrow();
        await expect(rsa_2.decrypt(encrypted_2)).rejects.toThrow();
    });
});
