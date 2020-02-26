export class DiffieHellman
{
    private _diffie_hellman?: any;

    public constructor()
    {
        this._diffie_hellman = new (self as any).enigma.DiffieHellman();
    }

    public initialize(): void
    {
        this._diffie_hellman.initialize();
    }

    public get_public_key(): Buffer
    {
        return Buffer.from(this._diffie_hellman.get_public_key());
    }

    public derive_secret(peer_public_key: Buffer): Buffer
    {
        return Buffer.from(this._diffie_hellman.derive_secret(peer_public_key));
    }
}