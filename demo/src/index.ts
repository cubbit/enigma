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

const bo = async ()  => {
    await Enigma.init();

    const dh = (self as any).enigma.DiffieHellman;
    
    const pvk1 = dh.generate_private_key();
    const pvk2 = dh.generate_private_key();

    const heap_private_key1 = em_array_malloc((self as any).enigma, Buffer.from(pvk1));
    const heap_private_key2 = em_array_malloc((self as any).enigma, Buffer.from(pvk2));

    const pbk1 = dh.get_public_key(heap_private_key1.byteOffset);
    const pbk2 = dh.get_public_key(heap_private_key1.byteOffset);

    console.log(pbk1);
    console.log(pbk2);

    const heap_pbk_key1 = em_array_malloc((self as any).enigma, Buffer.from(pbk1));
    const heap_pbk_key2 = em_array_malloc((self as any).enigma, Buffer.from(pbk2));

    const secret1 = dh.derive_secret(heap_private_key1.byteOffset, heap_private_key1.byteOffset, heap_private_key1.byteLength) as Buffer;
    const secret2 = dh.derive_secret(heap_private_key2.byteOffset, heap_private_key2.byteOffset, heap_private_key2.byteLength) as Buffer;

    em_array_free((self as any).enigma, heap_pbk_key1);
    em_array_free((self as any).enigma, heap_pbk_key2);

    em_array_free((self as any).enigma, heap_private_key1);
    em_array_free((self as any).enigma, heap_private_key2);

    console.log(secret1.compare(secret2));
};

bo();