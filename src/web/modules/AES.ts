import {Transform, TransformCallback} from 'stream';

import {defaults} from '../../defaults';
import {em_array_free, em_array_malloc} from '../utils';
import {Random} from './Random';

export declare namespace AES
{
    export interface Options
    {
        key?: Buffer;
        key_bits?: number;
        algorithm?: Algorithm;
    }
}

export class AESCipher extends Transform
{
    private _context_offset: any;
    private _tag!: Buffer;

    public constructor(context_offset: any)
    {
        super();

        this._context_offset = context_offset;

        this.on('finish', () =>
        {
            const cipher = (self as any).enigma.AES.encrypt_finalize(this._context_offset);
            this.push(Buffer.from(cipher));
            em_array_free((self as any).enigma, cipher);

            const tag = (self as any).enigma.AES.get_tag(this._context_offset);
            this._tag = Buffer.from(tag);

            (self as any).enigma.AES.context_free(this._context_offset);
        });
    }

    public _transform(chunk: Buffer, _: string, callback: TransformCallback): void
    {
        const heap_chunk = em_array_malloc((self as any).enigma, chunk);
        const cipher = (self as any).enigma.AES.encrypt(this._context_offset, heap_chunk.byteOffset, chunk.length);
        em_array_free((self as any).enigma, heap_chunk);

        callback(undefined, Buffer.from(cipher));
        em_array_free((self as any).enigma, cipher);
    }

    public getAuthTag(): Buffer
    {
        if(!this._tag)
            throw new Error('Encryption is not yet completed');
        return this._tag;
    }
}

export class AESDecipher extends Transform
{
    private _context_offset: any;

    public constructor(context_offset: any)
    {
        super();

        this._context_offset = context_offset;

        this.on('finish', () =>
        {
            const result = (self as any).enigma.AES.decrypt_finalize(this._context_offset);
            if(!result.success)
                this.emit('error', new Error('Unable to authenticate data'));

            this.push(Buffer.from(result.plain));
            em_array_free((self as any).enigma, result.plain);

            (self as any).enigma.AES.context_free(this._context_offset);
        });
    }

    public _transform(chunk: Buffer, _: string, callback: TransformCallback): void
    {
        const heap_chunk = em_array_malloc((self as any).enigma, chunk);
        const plain = (self as any).enigma.AES.decrypt(this._context_offset, heap_chunk.byteOffset, chunk.length);
        em_array_free((self as any).enigma, heap_chunk);

        callback(undefined, Buffer.from(plain));
        em_array_free((self as any).enigma, plain);
    }

    public setAuthTag(tag: Buffer): void
    {
        if(tag.length !== 16)
            throw new Error('Tag must be 16 bytes');

        const heap_tag = em_array_malloc((self as any).enigma, tag);
        (self as any).enigma.AES.set_tag(this._context_offset, heap_tag.byteOffset);
        em_array_free((self as any).enigma, heap_tag);
    }
}

export class AES
{
    private _key: Buffer | undefined;
    private _algorithm: AES.Algorithm | undefined;

    private _webcrypto_key: CryptoKey | undefined;

    public async init(options?: AES.Options): Promise<AES>
    {
        const key_bits = (options && options.key_bits) || defaults.aes.key_bits;
        this._key = (options && options.key) || AES.create_key(key_bits);
        // @ts-ignore
        this._algorithm = (options && options.algorithm) || AES.Algorithm[defaults.aes.algorithm as any] as AES.Algorithm;

        this._webcrypto_key = await self.crypto.subtle.importKey('raw', this._key.buffer, this._algorithm, false, ['encrypt', 'decrypt']);

        return this;
    }

    //#region static

    public static create_key(bits?: number): Buffer
    {
        return Random.bytes((bits || defaults.aes.key_bits) / 8);
    }

    //#endregion

    public async encrypt(message: string | Buffer, iv?: Buffer): Promise<{content: Buffer; iv: Buffer; tag?: Buffer}>
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');
        if(!iv)
            iv = Random.bytes(defaults.aes.iv_bytes);

        let content = Buffer.from(await self.crypto.subtle.encrypt({name: this._algorithm!, iv, counter: iv, length: defaults.aes.iv_bytes * 8, tagLength: defaults.aes.tag_bytes * 8}, this._webcrypto_key!, message.buffer));

        let tag;
        if(this._algorithm === AES.Algorithm.GCM)
        {
            tag = content.slice(-defaults.aes.tag_bytes);
            content = content.slice(0, -defaults.aes.tag_bytes);
        }

        return {content, tag, iv};
    }

    public async decrypt(cipher: {content: Buffer; iv: Buffer; tag?: Buffer}): Promise<Buffer>
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        if(this._algorithm === AES.Algorithm.GCM && !cipher.tag)
            throw new Error(`Algorithm ${AES.Algorithm.GCM} needs an auth tag`);

        let encrypted = cipher.content;
        if(this._algorithm === AES.Algorithm.GCM)
        {
            encrypted = Buffer.alloc(cipher.content.length + (cipher.tag as Buffer).length);
            encrypted.set(cipher.content);
            encrypted.set(cipher.tag!, cipher.content.length);
        }

        return Buffer.from(await self.crypto.subtle.decrypt({name: this._algorithm!, iv: cipher.iv, counter: cipher.iv, length: defaults.aes.iv_bytes * 8, tagLength: defaults.aes.tag_bytes * 8}, this._webcrypto_key!, encrypted.buffer));
    }

    public encrypt_stream(iv: Buffer): AESCipher
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        const heap_key = em_array_malloc((self as any).enigma, this._key);
        const heap_iv = em_array_malloc((self as any).enigma, iv);
        const context = (self as any).enigma.AES.encrypt_context(this._algorithm!, this._key.length, heap_key.byteOffset, iv.length, heap_iv.byteOffset);
        em_array_free((self as any).enigma, heap_key);
        em_array_free((self as any).enigma, heap_iv);
        return new AESCipher(context.byteOffset);
    }

    // @ts-ignore
    public decrypt_stream(iv: Buffer, tag?: Buffer): AESDecipher
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        const heap_key = em_array_malloc((self as any).enigma, this._key);
        const heap_iv = em_array_malloc((self as any).enigma, iv);
        const context = (self as any).enigma.AES.decrypt_context(this._algorithm!, this._key.length, heap_key.byteOffset, iv.length, heap_iv.byteOffset);
        em_array_free((self as any).enigma, heap_key);
        em_array_free((self as any).enigma, heap_iv);

        const decipher = new AESDecipher(context.byteOffset);
        if(tag)
            decipher.setAuthTag(tag);
        return decipher;
    }

    //#region getters

    public get key(): Buffer
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        return this._key;
    }

    public get algorithm(): AES.Algorithm
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        return this._algorithm!;
    }

    //#endregion
}

// tslint:disable-next-line:no-namespace
export namespace AES
{
    export enum Algorithm
    {
        GCM = 'AES-GCM',
        CTR = 'AES-CTR'
    }
}
