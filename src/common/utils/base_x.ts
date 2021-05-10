import * as BaseX from 'base-x';

export namespace base_x
{
    export type BaseXEncoder = (value: Buffer) => string;
    export type BaseXDecoder = (value: string) => Buffer;

    const ENCODINGS = {
        base58: '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
    };

    export enum Encoding
    {
        BASE58 = 'base58',
    }

    export function make_encoder(to: Encoding): BaseXEncoder
    {
        const encoder = BaseX(ENCODINGS[to]);

        return (value: Buffer): string => encoder.encode(value);
    }

    export function make_decoder(from: Encoding): BaseXDecoder
    {
        const decoder = BaseX(ENCODINGS[from]);

        return (value: string): Buffer => decoder.decode(value);
    }
}
