import Enigma from '@cubbit/enigma';

declare type JSArray = Buffer | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

function em_array_malloc(context: any, typed_array: JSArray): Uint8Array
{
    const bytes = typed_array.length * typed_array.BYTES_PER_ELEMENT;
    const ptr = context._malloc(bytes);
    const heap_bytes = new Uint8Array(context.HEAPU8.buffer, ptr, bytes);
    heap_bytes.set(new Uint8Array(typed_array.buffer, 0, bytes));
    return heap_bytes;
}

function em_array_free(context: any, heap_bytes: Uint8Array): void
{
    context._free(heap_bytes.byteOffset);
}
const bo = async () => {
    await Enigma.init();

    const dh1 = new Enigma.DiffieHellman();
    const dh2 = new Enigma.DiffieHellman();

    dh1.initialize();
    dh2.initialize();

    dh1.get_public_key();
    dh2.get_public_key();

    const s1 = await dh1.derive_secret(dh2.get_public_key());
    const s2 = await dh2.derive_secret(dh1.get_public_key());

    console.log(dh1.get_public_key(), s1, s2, s1.compare(s2));

};

const bo2 = async ()  => {

    await Enigma.init();

    console.log((self as any).enigma);

    const DH = (self as any).enigma.DiffieHellman;

    const dh1 = new DH();
    const dh2 = new DH();

    const pvk1 = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgdC/t+zrXSY/A8Ss8\ngd94Wlbx6nO5+VM76Srj+mN7Ln6hRANCAATBuzAqdaqPQyMU0nBuDEptswRnlU0K\nFcVEWB7+lMFBNDqH9kjY0wMvhpxljixU7PMngZSow4K6OZNJd9ZGjPHt\n-----END PRIVATE KEY-----';

    const pvk2 = '-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQgQ4cKqKfHHWCzpo4/\nRhzyW40deOZlrdmOlP7NAyHGmEShRANCAATw7RPVQwn30ai1Vg9taTBVO7qCeKk1\nnBffK448LBLV7TWi4yKn51TCjjmiu5+JX7rbI+bo+GsViOkE2ReAzCAz\n-----END PRIVATE KEY-----';

    // const seed = new Uint8Array(32);
    // (self as any).crypto.getRandomValues(seed);
    // const heap_seed1 = em_array_malloc((self as any).enigma, Buffer.from(seed));

    // dh1.set_private(pvk1);
    // dh2.set_private(pvk2);

    dh1.initialize();
    dh2.initialize();

    console.log('secret1', dh1.get_private());
    console.log('secret2', dh2.get_private());

    const pbk1 = dh1.get_public_key();
    const pbk2 = dh2.get_public_key();

    let secret1;
    let secret2;

    secret1 = dh1.derive_secret(pbk2);
    secret2 =  dh2.derive_secret(pbk1);

    console.log(secret1);
    console.log(secret2);

    dh1.free();
    dh2.free();

    return;
    // const heap_pbk_key1 = em_array_malloc((self as any).enigma, Buffer.from(pbk1));
    // const heap_pbk_key2 = em_array_malloc((self as any).enigma, Buffer.from(pbk2));

    // console.log('ll', pvk1);
    // const secret1 = dh.derive_secret(heap_private_key1.byteOffset, heap_private_key1.byteLength, heap_pbk_key2.byteOffset, heap_pbk_key2.byteLength) as Buffer;
    // const secret2 = dh.derive_secret(heap_private_key2.byteOffset, heap_private_key2.byteLength, heap_pbk_key1.byteOffset, heap_pbk_key1.byteLength) as Buffer;

    // console.log('ll2', pvk1);
    
    // em_array_free((self as any).enigma, heap_pbk_key1);
    // em_array_free((self as any).enigma, heap_pbk_key2);

    // em_array_free((self as any).enigma, heap_private_key1);
    // em_array_free((self as any).enigma, heap_private_key2);

    // console.log(pvk1);
    // console.log(pvk2);

    // console.log(pbk1);
    // console.log(pbk2);
    // console.log(secret1);
    // console.log(secret2);
};
bo2().then().catch();
// for(let i = 0; i < 10; i++)
//     bo2().then().catch();