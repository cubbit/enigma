import {Cipher, CipherGCM, createCipheriv, createDecipheriv, Decipher, DecipherGCM} from 'crypto';

import {defaults} from '../../defaults';
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

export class AES
{
    private _key: Buffer | undefined;
    private _algorithm: AES.Algorithm | undefined;
    private _crypto_algorithm: string | undefined;

    public async init(options?: AES.Options): Promise<AES>
    {
        const key_bits = (options && options.key_bits) || defaults.aes.key_bits;
        this._key = (options && options.key) || AES.create_key(key_bits);
        this._algorithm = (options && options.algorithm) || AES.Algorithm[defaults.aes.algorithm as any] as AES.Algorithm;
        this._crypto_algorithm = `aes-${key_bits}-${this._algorithm}`;

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
            message = Buffer.from(message);
        if(!iv)
            iv = Random.bytes(defaults.aes.iv_bytes);

        // TODO: set tag length (waiting new node types)
        const cipher = createCipheriv(this._crypto_algorithm!, this._key, iv);
        const content = Buffer.concat([cipher.update(message), cipher.final()]);

        let tag;
        if(this._algorithm === AES.Algorithm.GCM)
            tag = (cipher as CipherGCM).getAuthTag();

        return {content, tag, iv};
    }

    public async decrypt(cipher: {content: Buffer; iv: Buffer; tag?: Buffer}): Promise<Buffer>
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        if(this._algorithm === AES.Algorithm.GCM && !cipher.tag)
            throw new Error(`Algorithm ${AES.Algorithm.GCM} needs an auth tag`);

        // TODO: set tag length (waiting new node types)
        const decipher = createDecipheriv(this._crypto_algorithm!, this._key, cipher.iv);

        if(this._algorithm === AES.Algorithm.GCM)
            (decipher as DecipherGCM).setAuthTag(cipher.tag as Buffer);

        return Buffer.concat([decipher.update(cipher.content), decipher.final()]);
    }

    public encrypt_stream(iv: Buffer): Cipher | CipherGCM
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        return createCipheriv(this._crypto_algorithm!, this._key, iv);
    }

    public decrypt_stream(iv: Buffer, tag?: Buffer): Decipher | DecipherGCM
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        if(this._algorithm === AES.Algorithm.GCM && !tag)
            throw new Error(`Algoritm ${AES.Algorithm.GCM} needs an auth tag`);

        const decipher = createDecipheriv(this._crypto_algorithm!, this._key, iv);

        if(this._algorithm === AES.Algorithm.GCM)
            (decipher as DecipherGCM).setAuthTag(tag as Buffer);

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
        GCM = 'gcm',
        CTR = 'ctr'
    }
}
