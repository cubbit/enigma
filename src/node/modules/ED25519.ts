// tslint:disable-next-line:no-var-requires
const bindings = require('bindings')('enigma.node');

export declare namespace ED25519
{
    export interface Keypair
    {
        public_key: Buffer;
        private_key: Buffer;
    }

    export interface Options
    {
        keypair?: Keypair;
        seed?: Buffer;
    }
}

export class ED25519
{
    private _keypair: ED25519.Keypair;

    public constructor(options?: ED25519.Options)
    {
        this._keypair = (options && options.keypair) || ED25519.create_keypair((options && options.seed));
    }

    //#region static

    public static create_seed(): Buffer
    {
        return bindings.ed25519_create_seed();
    }

    public static create_keypair(seed?: Buffer): ED25519.Keypair
    {
        if(!seed)
            seed = this.create_seed();

        return bindings.ed25519_create_keypair(seed);
    }

    public static verify(message: string | Buffer, public_key: Buffer, signature: Buffer): boolean
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        return bindings.ed25519_verify(signature, message, public_key);
    }

    //#endregion

    public sign(message: string | Buffer): Buffer
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        return bindings.ed25519_sign(message, this._keypair.private_key, this._keypair.public_key);
    }

    //#region getters

    public get keypair(): ED25519.Keypair
    {
        return this._keypair;
    }

    //#endregion
}
