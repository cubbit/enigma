import {createECDH, ECDH} from 'crypto';

import {Hash} from './Hash';

export class DiffieHellman
{
    private _public_key?: Buffer;
    private _diffie_hellman: ECDH;

    public constructor() {
        this._diffie_hellman = createECDH('prime256v1');
    }

    public initialize(): void
    {
        this._public_key = this._diffie_hellman.generateKeys();
    }

    public get_public_key(): Buffer
    {
        if(!this._public_key)
            throw new Error('DiffieHellman not initialized');

        return this._public_key;
    }

    public async derive_secret(peer_public_key: Buffer): Promise<Buffer>
    {
        if(!this._public_key)
            throw new Error('DiffieHellman not initialized');

        const secret:Buffer = this._diffie_hellman.computeSecret(peer_public_key);

        return Hash.digest_buffer(secret);
    }
}
