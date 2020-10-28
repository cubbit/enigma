export * from './modules/Random';
export * from './modules/KeyDerivation';
export * from './modules/Hash';
export * from './modules/ED25519';
export * from './modules/X25519';
export * from './modules/RSA';
export * from './modules/AES';
export * from './modules/DiffieHellman';

export * from './helpers/Attorney';

export function init(): Promise<void>
{
    return Promise.resolve();
}
