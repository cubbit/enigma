export * from './modules/Random';
export * from './modules/KeyDerivation';
export * from './modules/Hash';
export * from './modules/ED25519';
export * from './modules/RSA';
export * from './modules/AES';
export * from './modules/DiffieHellman';

export * from './helpers/Attorney';

export function init(): Promise<void>
{
    return new Promise<void>((resolve) =>
    {
        if(!(self as any).enigma)
        {
            (self as any).enigma = {};
            let enigma_module: any;

            if(typeof document !== 'undefined')
                enigma_module = require('../wasm/enigma.web.js')();
            else
                enigma_module = require('../wasm/enigma.worker.js')();

            enigma_module.then((enigma: any) =>
            {
                (self as any).enigma = enigma;
                resolve();
            });
        }
        else
            resolve();
    });
}
