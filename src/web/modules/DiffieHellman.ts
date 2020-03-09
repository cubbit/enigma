export class DiffieHellman
{
    private _diffie_hellman?: any;

    public constructor()
    {
        this._diffie_hellman = new (self as any).enigma.DiffieHellman();
    }

    public initialize(): void
    {
        const returned: any = this._diffie_hellman.initialize();

        if(returned.error)
            throw new Error(returned);
    }

    public get_public_key(): string
    {
        const public_key: any = this._diffie_hellman.get_public_key();

        if(public_key.error)
            throw new Error(public_key.error);

        return public_key.value;
    }

    public derive_secret(endpoint_public_key: Buffer): Promise<string>
    {
        const secret = this._diffie_hellman.derive_secret(endpoint_public_key.toString());

        if(secret.error)
            throw new Error(secret.error);

        return secret.value;
    }

    public free(): void
    {
        this._diffie_hellman.free();
    }
}