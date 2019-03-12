export * from './modules/Random';
export * from './modules/KeyDerivation';
export * from './modules/Hash';
export * from './modules/ED25519';
export * from './modules/RSA';
export * from './modules/AES';

export * from './helpers/Attorney';

export function init(): Promise<void>
{
    return new Promise<void>((resolve) =>
    {
        if(!(self as any).enigma)
        {
            (self as any).enigma = {};

            const enigma = require('../wasm/enigma.js');
            const enigma_module = enigma();
            enigma_module.onRuntimeInitialized = () =>
            {
                (self as any).enigma = enigma_module;
                resolve();
            };
        }
    });
}
