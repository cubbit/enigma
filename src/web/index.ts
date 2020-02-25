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
        console.log((self as any).enigma);
        
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

export function init2(_path: string = '../wasm/'): Promise<any>
{
    return new Promise<any>((resolve) =>
    {
        let enigma_module: any;
        
        if(typeof document !== 'undefined')
            enigma_module = require('../wasm/enigma.web.js')();
        else
            enigma_module = require('../wasm/enigma.worker.js')();

        enigma_module.onRuntimeInitialized = () =>
        {
            (self as any).enigma = enigma_module;
            resolve(enigma_module);
        };
    });
}