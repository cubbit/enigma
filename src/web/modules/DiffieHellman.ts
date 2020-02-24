import {em_array_free, em_array_malloc} from '../utils';
import {Hash} from './Hash';
export class DiffieHellman
{
    private _private_key?: Buffer;

    public constructor()
    {
        this._private_key = undefined;
    }

    public initialize(): void
    {
        const private_key: Buffer = (self as any).enigma.DiffieHellman.generate_private_key();

        if(private_key.byteLength === 0)
            throw new Error('Impossible to generate private key');

        this._private_key = Buffer.from(private_key);
    }

    public get_public_key(): Buffer
    {
        if(!this._private_key)
            throw new Error('Private key undefined');

        const heap_private_key = em_array_malloc((self as any).enigma, this._private_key);

        if(!heap_private_key)
            throw new Error('Private key undefined');

        const public_key: Buffer = (self as any).enigma.DiffieHellman.get_public_key(heap_private_key.byteOffset);

        console.log(public_key);

        em_array_free((self as any).enigma, heap_private_key);

        if(!public_key)
            throw new Error('Impossible to get public key');

        return Buffer.from(public_key);
    }

    public async derive_secret(peer_public_key: Buffer): Promise<Buffer>
    {
        if(!this._private_key)
            throw new Error('Private key undefined');
            
        const heap_private_key = em_array_malloc((self as any).enigma, this._private_key);

        const heap_peer_public_key = em_array_malloc((self as any).enigma, peer_public_key);

        const secret: Buffer = (self as any).enigma.DiffieHellman.derive_secret(heap_private_key.byteOffset, heap_peer_public_key.byteOffset, heap_peer_public_key.byteLength);

        em_array_free((self as any).enigma, heap_private_key);
        em_array_free((self as any).enigma, heap_peer_public_key);

        return Hash.digest_buffer(secret);
    }
}