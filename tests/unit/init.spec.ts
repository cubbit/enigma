
import Enigma from '../../src/';

describe('init', () =>
{

    it('should found enigma.web.js', async () =>
    {
        await Enigma.init();
    });
});