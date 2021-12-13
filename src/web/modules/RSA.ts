import {jwk2pem, pem2jwk, RSA_JWK} from 'pem-jwk';

import {defaults} from '../../defaults';

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

    private _webcrypto_private_key: CryptoKey | undefined;

    public async init(options?: RSA.Options): Promise<RSA>
    {
        this._keypair = (options && options.keypair) || await RSA.create_keypair({size: options && options.size, exponent: options && options.exponent});

        this._webcrypto_private_key = await self.crypto.subtle.importKey('jwk', pem2jwk(this._keypair.private_key.toString('utf8')), {name: 'RSA-OAEP', hash: {name: 'SHA-1'}}, false, ['decrypt']);

        return this;
    }

    //#region static

    public static async create_keypair(options?: RSA.KeypairOptions): Promise<RSA.Keypair>
    {
        const exponent = (options && options.exponent) || defaults.rsa.exponent;

        let partial = exponent;
        const bytes = Math.ceil(Math.log2(partial + 1) / 8);
        const exponent_buffer = Buffer.alloc(bytes);
        for(let byte = 1; byte <= bytes; byte++)
        {
            let value = 0;
            const enhancer = (bytes - byte) * 8;
            for(let bit = 7; bit >= 0; bit--)
            {
                const dividend = 2 ** (bit + enhancer);
                if(partial / dividend >= 1)
                {
                    partial = partial % dividend;
                    value += 2 ** bit;
                }
            }
            exponent_buffer.set([value], byte - 1);
        }

        const rsa = await self.crypto.subtle.generateKey({
            name: 'RSA-OAEP',
            modulusLength: (options && options.size) || defaults.rsa.key_bits,
            publicExponent: exponent_buffer,
            hash: {name: 'SHA-256'},
        }, true, ['encrypt', 'decrypt']);

        if(!rsa.publicKey)
            throw new Error('Failed to generate RSA public key');

        if(!rsa.privateKey)
            throw new Error('Failed to generate RSA private key');

        const public_key = Buffer.from(jwk2pem(await self.crypto.subtle.exportKey('jwk', rsa.publicKey) as RSA_JWK), 'utf8');
        const private_key = Buffer.from(jwk2pem(await self.crypto.subtle.exportKey('jwk', rsa.privateKey) as RSA_JWK), 'utf8');

        return {public_key, private_key};
    }

    public static async encrypt(message: string | Buffer, public_key: Buffer): Promise<Buffer>
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const rsa_public_key = await self.crypto.subtle.importKey('jwk', pem2jwk(public_key.toString('utf8')), {name: 'RSA-OAEP', hash: {name: 'SHA-1'}}, false, ['encrypt']);
        return Buffer.from(await self.crypto.subtle.encrypt({name: 'RSA-OAEP'}, rsa_public_key, message));
    }

    //#endregion

    public async decrypt(encrypted_message: Buffer): Promise<Buffer>
    {
        if(!this._keypair)
            throw new Error('Init method must be called first');

        return Buffer.from(await self.crypto.subtle.decrypt({name: 'RSA-OAEP'}, this._webcrypto_private_key!, encrypted_message.buffer));
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
