import {createECDH, ECDH} from 'crypto';

export class DiffieHellman
{
    private readonly _prime256v1_uncompressed_curved_name_pem_header_hex = '3059301306072a8648ce3d020106082a8648ce3d030107034200';
    private _public_key_pem?: string;
    private _diffie_hellman: ECDH;

    public constructor()
    {
        this._diffie_hellman = createECDH('prime256v1');
    }

    public initialize(): void
    {
        const public_key_hex = this._diffie_hellman.generateKeys('hex');

        const hex = Buffer.from(this._prime256v1_uncompressed_curved_name_pem_header_hex + public_key_hex, 'hex').toString('base64');

        this._public_key_pem = `-----BEGIN PUBLIC KEY-----\n${hex}\n-----END PUBLIC KEY-----`;
    }

    public get_public_key(): string
    {
        if(!this._public_key_pem)
            throw new Error('DiffieHellman not initialized');

        return this._public_key_pem;
    }

    public async derive_secret(endpoint_public_key_pem: string): Promise<string>
    {
        if(!this._public_key_pem)
            throw new Error('DiffieHellman not initialized');

        const endpoint_public_key = endpoint_public_key_pem.replace('-----BEGIN PUBLIC KEY-----', '').replace('-----END PUBLIC KEY-----', '');

        const endpoint_public_key_hex = Buffer.from(endpoint_public_key, 'base64').toString('hex').substr(this._prime256v1_uncompressed_curved_name_pem_header_hex.length);

        return this._diffie_hellman.computeSecret(endpoint_public_key_hex, 'hex', 'hex');
    }

    public free(): void
    {
        this._public_key_pem = '';
    }
}
