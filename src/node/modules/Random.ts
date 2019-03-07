import {randomBytes} from 'crypto';

export namespace Random
{
    export function integer(bits: 8 | 16 | 24 | 32 | 40 | 48): number
    {
        const length = bits / 8;
        return Random.bytes(length).readUIntBE(0, length);
    }

    export function bytes(length: number): Buffer
    {
        return randomBytes(length);
    }
}
