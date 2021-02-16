import {ED25519} from './ED25519';
import {AES} from './AES';

// tslint:disable-next-line:no-var-requires
const X25519_key_exchange = require('js-x25519');

export declare namespace X25519
{
    export interface Options
    {
        key?: Buffer;
        seed?: Buffer;
    }
}

export class X25519
{
    private _key: Buffer | undefined;
    private _aes: AES | undefined;

    public async init(options?: X25519.Options): Promise<X25519>
    {
        this._key = options?.key || X25519.create_key(options?.seed);
        this._aes = await new AES().init({key: this._key});
    
        return this;
    }

    //#region static

    public static create_key(seed?: Buffer): Buffer
    {
        if(!seed)
            seed = ED25519.create_seed();

        const keypair = ED25519.create_keypair(seed);

        return Buffer.from(X25519_key_exchange.getSharedKey(seed, keypair.public_key)).slice(0,32);
    }

    //#endregion

    public async encrypt(message: string | Buffer): Promise<{content: Buffer; iv: Buffer; tag?: Buffer}>
    {
        if(!this._aes)
            throw new Error('Init method must be called first');

        return this._aes.encrypt(message);
    }

    public async decrypt(cipher: {content: Buffer; iv: Buffer; tag?: Buffer}): Promise<Buffer>
    {
        if(!this._aes)
            throw new Error('Init method must be called first');
            
        return this._aes.decrypt(cipher);
    }

    //#region getters

    public get key(): Buffer
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        return this._key;
    }

    public get public_key(): Buffer
    {
        if(!this._key)
            throw new Error('Init method must be called first');

        return Buffer.from(X25519_key_exchange.getPublic(this._key));
    }

    //#endregion
}
