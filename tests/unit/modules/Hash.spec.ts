import * as fs from 'fs-extra';
import * as os from 'os';
import * as path from 'path';

import Enigma from '../../../src';

const message = 'To be hashed';
const hash_base64 = 'si/Bs1S27SaG5KSW0R+Ns5wSYZUkPCQeWJN9vJxMKaA=';
const hash_hex = 'b22fc1b354b6ed2686e4a496d11f8db39c126195243c241e58937dbc9c4c29a0';

describe('Hash', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should digest the same hash for the same message', async () =>
    {
        expect.assertions(1);
        expect(await Enigma.Hash.digest(message)).toBe(await Enigma.Hash.digest(message));
    });

    it('should digest a specific message', async () =>
    {
        expect.assertions(2);
        expect(await Enigma.Hash.digest(message)).toBe(hash_base64);
        expect(await Enigma.Hash.digest(message, {encoding: Enigma.Hash.Encoding.HEX})).toBe(hash_hex);
    });

    it('should digest a specific file', async () =>
    {
        expect.assertions(2);
        const test_file = 'cubbit_hash_file_test';
        const test_path = path.resolve(os.tmpdir(), test_file);
        fs.writeFileSync(test_path, message);
        expect(await Enigma.Hash.digest_file(test_path)).toBe(hash_base64);
        expect(await Enigma.Hash.digest_file(test_path, {encoding: Enigma.Hash.Encoding.HEX})).toBe(hash_hex);
    });

    it('should throw digesting a non-existing file', async () =>
    {
        expect.assertions(1);
        const test_file = 'cubbit_hash_file_test';
        const test_path = path.resolve(os.tmpdir(), test_file);
        try
        {
            fs.removeSync(test_path);
        }
        catch(error) {/**/}
        await expect(Enigma.Hash.digest_file(test_path)).rejects.toThrow();
    });
});
