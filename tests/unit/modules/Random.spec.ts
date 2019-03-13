import Enigma from '../../../src';

describe('Random', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should generate random integers', () =>
    {
        const bits: (8 | 16 | 24 | 32 | 40 | 48)[] = [8, 16, 24, 32, 40, 48];
        for(const bit of bits)
            expect(Enigma.Random.integer(bit)).toBeLessThan(2**bit);
    });

    it('should generate random bytes', () =>
    {
        const length = 32;
        const buffer = Enigma.Random.bytes(length);
        expect(buffer.length).toBe(length);
    });
});
