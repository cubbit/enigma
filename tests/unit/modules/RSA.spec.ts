import * as pem_jwk from 'pem-jwk';

import Enigma from '../../../src';

describe('RSA', () =>
{
    it('should generate a random keypair', () =>
    {
        const keypair = Enigma.RSA.create_keypair();
        expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
        expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
    });

    it('should generate a keypair with given size', () =>
    {
        const sizes = [1024, 2048, 4096];
        for(const size of sizes)
        {
            const keypair = Enigma.RSA.create_keypair({size});
            expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
            expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
            const private_jwk = pem_jwk.pem2jwk(keypair.private_key.toString());
            const public_jwk = pem_jwk.pem2jwk(keypair.public_key.toString());
            expect(Buffer.from(private_jwk.n, 'base64').length * 8).toBe(size);
            expect(Buffer.from(public_jwk.n, 'base64').length * 8).toBe(size);
        }
    });

    it('should generate a keypair with given exponent', () =>
    {
        const exponents = [32769, 65537, 131073];
        for(const exponent of exponents)
        {
            const keypair = Enigma.RSA.create_keypair({exponent});
            expect(keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
            expect(keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
            const private_jwk = pem_jwk.pem2jwk(keypair.private_key.toString());
            const public_jwk = pem_jwk.pem2jwk(keypair.public_key.toString());
            expect(Buffer.from(private_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
            expect(Buffer.from(public_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
        }
    });

    it('should use a given size and exponent', () =>
    {
        const exponent = 65537;
        const size = 2048;
        const rsa = new Enigma.RSA({size, exponent});
        expect(rsa.keypair.private_key.toString()).toContain('-----BEGIN RSA PRIVATE KEY-----');
        expect(rsa.keypair.public_key.toString()).toContain('-----BEGIN RSA PUBLIC KEY-----');
        const private_jwk = pem_jwk.pem2jwk(rsa.keypair.private_key.toString());
        const public_jwk = pem_jwk.pem2jwk(rsa.keypair.public_key.toString());
        expect(Buffer.from(private_jwk.n, 'base64').length * 8).toBe(size);
        expect(Buffer.from(public_jwk.n, 'base64').length * 8).toBe(size);
        expect(Buffer.from(private_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
        expect(Buffer.from(public_jwk.e, 'base64').toString('hex').replace(/^0*/, '')).toBe(exponent.toString(16));
    });

    it('should use a given keypair', () =>
    {
        const keypair = Enigma.RSA.create_keypair();
        const rsa = new Enigma.RSA({keypair});
        expect(rsa.keypair).toEqual(keypair);
    });

    it('should encrypt and decrypt correctly', () =>
    {
        const message = 'To be encrypted';
        const rsa_1 = new Enigma.RSA();
        const rsa_2 = new Enigma.RSA();
        const encrypted_1 = Enigma.RSA.encrypt(message, rsa_1.keypair.public_key);
        const encrypted_2 = Enigma.RSA.encrypt(Buffer.from(message), rsa_1.keypair.public_key);
        expect(rsa_1.decrypt(encrypted_1)).toEqual(Buffer.from(message));
        expect(rsa_1.decrypt(encrypted_2)).toEqual(Buffer.from(message));
        expect(() => rsa_2.decrypt(encrypted_1)).toThrowError();
        expect(() => rsa_2.decrypt(encrypted_2)).toThrowError();
    });
});
