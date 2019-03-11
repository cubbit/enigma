import Enigma from '../../../src';

describe('Attorney', () =>
{
    it('should redact and verify correctly', () =>
    {
        const object = {message: 'To be signed'};
        const ecc_1 = new Enigma.ED25519();
        const ecc_2 = new Enigma.ED25519();
        const contract = Enigma.Attorney.redact(object, ecc_1);
        expect(Enigma.Attorney.verify(contract, ecc_1.keypair.public_key)).toBe(true);
        expect(Enigma.Attorney.verify(contract, ecc_2.keypair.public_key)).toBe(false);
    });
});
