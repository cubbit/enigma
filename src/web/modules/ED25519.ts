import {em_array_free, em_array_malloc} from '../utils';
import {Random} from './Random';

export namespace ED25519
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
        return Random.bytes(32);
    }

    public static create_keypair(seed?: Buffer): ED25519.Keypair
    {
        if(!seed)
            seed = this.create_seed();

        if(seed.length !== 32)
            throw new Error('Seed must be 32 bytes');

        const heap_seed = em_array_malloc((self as any).enigma, seed);
        const keypair: ED25519.Keypair = (self as any).enigma.ED25519.create_keypair(heap_seed.byteOffset, seed.length);
        keypair.public_key = Buffer.from(keypair.public_key);
        keypair.private_key = Buffer.from(keypair.private_key);
        em_array_free((self as any).enigma, heap_seed);
        return keypair;
    }

    public static verify(message: string | Buffer, public_key: Buffer, signature: Buffer): boolean
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const heap_signature = em_array_malloc((self as any).enigma, signature);
        const heap_message = em_array_malloc((self as any).enigma, message);
        const heap_public_key = em_array_malloc((self as any).enigma, public_key);

        const result = (self as any).enigma.ED25519.verify(heap_signature.byteOffset, heap_signature.length, heap_message.byteOffset, heap_message.length, heap_public_key.byteOffset, heap_public_key.length);

        em_array_free((self as any).enigma, heap_signature);
        em_array_free((self as any).enigma, heap_message);
        em_array_free((self as any).enigma, heap_public_key);

        return result;
    }

    //#endregion

    public sign(message: string | Buffer): Buffer
    {
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const heap_message = em_array_malloc((self as any).enigma, message);
        const heap_public_key = em_array_malloc((self as any).enigma, this._keypair.public_key);
        const heap_private_key = em_array_malloc((self as any).enigma, this._keypair.private_key);

        const signature: Buffer = (self as any).enigma.ED25519.sign(heap_message.byteOffset, heap_message.length, heap_public_key.byteOffset, this._keypair.public_key.length, heap_private_key.byteOffset, this._keypair.private_key.length);

        em_array_free((self as any).enigma, heap_message);
        em_array_free((self as any).enigma, heap_public_key);
        em_array_free((self as any).enigma, heap_private_key);

        return Buffer.from(signature);
    }

    public get keypair(): ED25519.Keypair
    {
        return this._keypair;
    }
}
