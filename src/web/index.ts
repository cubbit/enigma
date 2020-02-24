export * from './modules/Random';
export * from './modules/KeyDerivation';
export * from './modules/Hash';
export * from './modules/ED25519';
export * from './modules/RSA';
export * from './modules/AES';
export * from './modules/DiffieHellman';

export * from './helpers/Attorney';

export function init(_path: string = '../wasm/'): Promise<void>
{
    return new Promise<void>((resolve) =>
    {
        if((self as any).enigma)
            return resolve();

        (self as any).enigma = {};
        let enigma_module: any;
        
        if(typeof document !== 'undefined')
            enigma_module = require('../wasm/enigma.web.js')();
        else
            enigma_module = require('../wasm/enigma.worker.js')();

        enigma_module.onRuntimeInitialized = () =>
        {
            (self as any).enigma = enigma_module;
            resolve();
        };
    });
}
