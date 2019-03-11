export declare type JSArray = Buffer | Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array;

export function em_array_malloc(context: any, typed_array: JSArray): Uint8Array
{
    const bytes = typed_array.length * typed_array.BYTES_PER_ELEMENT;
    const ptr = context._malloc(bytes);
    const heap_bytes = new Uint8Array(context.HEAPU8.buffer, ptr, bytes);
    heap_bytes.set(new Uint8Array(typed_array.buffer, 0, bytes));
    return heap_bytes;
}

export function em_array_free(context: any, heap_bytes: Uint8Array): void
{
    context._free(heap_bytes.byteOffset);
}
