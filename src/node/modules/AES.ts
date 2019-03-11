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
    private _key: Buffer;
    private _algorithm: AES.Algorithm;
    private _crypto_algorithm: string;

    public constructor(options?: AES.Options)
    {
        const key_bits = (options && options.key_bits) || defaults.aes.key_bits;
        this._key = (options && options.key) || AES.create_key(key_bits);
        this._algorithm = (options && options.algorithm) || AES.Algorithm[defaults.aes.algorithm as any] as AES.Algorithm;
        this._crypto_algorithm = `aes-${key_bits}-${this._algorithm}`;
    }

    //#region static

    public static create_key(bits?: number): Buffer
    {
        return Random.bytes((bits || defaults.aes.key_bits) / 8);
    }

    //#endregion

    public encrypt(message: string | Buffer, iv?: Buffer): {content: Buffer; iv: Buffer; tag?: Buffer}
    {
        if(typeof message === 'string')
            message = Buffer.from(message);
        if(!iv)
            iv = Random.bytes(defaults.aes.iv_bytes);

        // TODO: set tag length (waiting new node types)
        const cipher = createCipheriv(this._crypto_algorithm, this._key, iv);
        const content = Buffer.concat([cipher.update(message), cipher.final()]);

        let tag;
        if(this._algorithm === AES.Algorithm.GCM)
            tag = (cipher as CipherGCM).getAuthTag();

        return {content, tag, iv};
    }

    public decrypt(cipher: {content: Buffer; iv: Buffer; tag?: Buffer}): Buffer
    {
        if(this._algorithm === AES.Algorithm.GCM && !cipher.tag)
            throw new Error(`Algorithm ${AES.Algorithm.GCM} needs an auth tag`);

        // TODO: set tag length (waiting new node types)
        const decipher = createDecipheriv(this._crypto_algorithm, this._key, cipher.iv);

        if(this._algorithm === AES.Algorithm.GCM)
            (decipher as DecipherGCM).setAuthTag(cipher.tag as Buffer);

        return Buffer.concat([decipher.update(cipher.content), decipher.final()]);
    }

    public encrypt_stream(iv: Buffer): Cipher | CipherGCM
    {
        // TODO: set tag length (waiting new node types)
        return createCipheriv(this._crypto_algorithm, this._key, iv);
    }

    public decrypt_stream(iv: Buffer, tag?: Buffer): Decipher | DecipherGCM
    {
        if(this._algorithm === AES.Algorithm.GCM && !tag)
            throw new Error(`Algoritm ${AES.Algorithm.GCM} needs an auth tag`);

        // TODO: set tag length (waiting new node types)
        const decipher = createDecipheriv(this._crypto_algorithm, this._key, iv);

        if(this._algorithm === AES.Algorithm.GCM)
            (decipher as DecipherGCM).setAuthTag(tag as Buffer);

        return decipher;
    }

    //#region getters

    public get key(): Buffer
    {
        return this._key;
    }

    public get algorithm(): AES.Algorithm
    {
        return this._algorithm;
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
