import {CipherGCM} from 'crypto';
import {Stream} from 'stream';

import Enigma from '../../../src';
import {defaults} from '../../../src/defaults';

describe('AES', () =>
{
    beforeAll(async () =>
    {
        await Enigma.init();
    });

    it('should generate a random key', () =>
    {
        expect(Enigma.AES.create_key()).toBeDefined();
    });

    it('should generate a key with given size', () =>
    {
        const sizes = [128, 256, 512];
        for(const size of sizes)
            expect(Enigma.AES.create_key(size).length * 8).toBe(size);
    });

    it('should use a given size and algorithm', async () =>
    {
        expect.assertions(2);
        const key_bits = 128;
        const algorithm = Enigma.AES.Algorithm.CTR;
        const aes = new Enigma.AES();
        await aes.init({key_bits, algorithm});
        expect(aes.key.length * 8).toBe(key_bits);
        expect(aes.algorithm).toBe(algorithm);
    });

    it('should use a given key', async () =>
    {
        expect.assertions(1);
        const key = Enigma.AES.create_key();
        const aes = new Enigma.AES();
        await aes.init({key});
        expect(aes.key).toEqual(key);
    });

    it('should encrypt and decrypt correctly', async () =>
    {
        expect.assertions(2);
        const message = 'To be encrypted';
        const aes_1 = new Enigma.AES();
        await aes_1.init();
        const aes_2 = new Enigma.AES();
        await aes_2.init();
        const encrypted = await aes_1.encrypt(message);
        expect((await aes_1.decrypt(encrypted)).toString()).toBe(message);
        await expect(aes_2.decrypt(encrypted)).rejects.toThrow();
    });

    it('should encrypt and decrypt correctly with stream', async (done) =>
    {
        expect.assertions(1);
        const message = 'To be encrypted';
        const read_stream = new Stream.Readable();

        const aes_1 = new Enigma.AES();
        await aes_1.init();
        const aes_2 = new Enigma.AES();
        await aes_2.init();
        const iv = Enigma.Random.bytes(defaults.aes.iv_bytes);
        const enc_stream = aes_1.encrypt_stream(iv);

        read_stream.pipe(enc_stream);

        let enc_buffer = Buffer.alloc(0);
        enc_stream.on('readable', () =>
        {
            const data = enc_stream.read() as Buffer;
            if(data)
                enc_buffer = Buffer.concat([enc_buffer, data]);
        });

        enc_stream.on('end', () =>
        {
            const tag = (enc_stream as CipherGCM).getAuthTag();
            let enc_read_stream = new Stream.Readable();
            const dec_stream_1 = aes_1.decrypt_stream(iv, tag);
            enc_read_stream.pipe(dec_stream_1);

            let dec_buffer_1 = Buffer.alloc(0);
            dec_stream_1.on('readable', () =>
            {
                const data = dec_stream_1.read() as Buffer;
                if(data)
                    dec_buffer_1 = Buffer.concat([dec_buffer_1, data]);
            });

            dec_stream_1.on('end', () =>
            {
                expect(dec_buffer_1.toString()).toBe(message);

                enc_read_stream = new Stream.Readable();
                const dec_stream_2 = aes_2.decrypt_stream(iv, tag);
                enc_read_stream.pipe(dec_stream_2);

                let dec_buffer_2 = Buffer.alloc(0);
                dec_stream_2.on('readable', () =>
                {
                    const data = dec_stream_2.read() as Buffer;
                    if(data)
                        dec_buffer_2 = Buffer.concat([dec_buffer_2, data]);
                });

                dec_stream_2.on('error', () => done());

                enc_read_stream.push(enc_buffer);
                enc_read_stream.push(null);
            });

            enc_read_stream.push(enc_buffer);
            enc_read_stream.push(null);
        });

        read_stream.push(message);
        read_stream.push(null);
    });

    it('should throw decrypting in GCM mode without tag', async () =>
    {
        expect.assertions(2);
        const aes = new Enigma.AES();
        await aes.init();
        const cipher = {content: Buffer.alloc(0), iv: Buffer.alloc(0)};
        await expect(aes.decrypt(cipher)).rejects.toThrow();
        expect(() => aes.decrypt_stream(cipher.iv)).toThrowError();
    });
});
