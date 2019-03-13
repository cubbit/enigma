import * as constants from 'constants';
import {privateDecrypt, publicEncrypt} from 'crypto';

import {defaults} from '../../defaults';

// tslint:disable-next-line:no-var-requires
const bindings = require('bindings')('enigma.node');

export declare namespace RSA
{
    export interface Keypair
    {
        public_key: Buffer;
        private_key: Buffer;
    }

    export interface KeypairOptions
    {
        size?: number;
        exponent?: number;
    }

    export interface Options extends KeypairOptions
    {
        keypair?: Keypair;
    }
}

export class RSA
{
    private _keypair: RSA.Keypair | undefined;

    public async init(options?: RSA.Options): Promise<RSA>
    {
        this._keypair = (options && options.keypair) || await RSA.create_keypair({size: options && options.size, exponent: options && options.exponent});

        return this;
    }

    //#region static

    public static async create_keypair(options?: RSA.KeypairOptions): Promise<RSA.Keypair>
    {
        return bindings.rsa_create_keypair((options && options.size) || defaults.rsa.key_bits, (options && options.exponent) || defaults.rsa.exponent);
    }

    public static async encrypt(message: string | Buffer, public_key: Buffer): Promise<Buffer>
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        return publicEncrypt({key: public_key.toString(), padding: constants.RSA_PKCS1_OAEP_PADDING}, message);
    }

    //#endregion

    public async decrypt(encrypted_message: Buffer): Promise<Buffer>
    {
        if(!this._keypair)
            throw new Error('Init method must be called first');

        return privateDecrypt({key: Buffer.concat([this._keypair.public_key, this._keypair.private_key]).toString(), padding: constants.RSA_PKCS1_OAEP_PADDING}, encrypted_message);
    }

    //#region getters

    public get keypair(): RSA.Keypair
    {
        if(!this._keypair)
            throw new Error('Init method must be called first');

        return this._keypair;
    }

    //#endregion
}
