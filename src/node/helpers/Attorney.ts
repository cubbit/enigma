import {defaults} from '../../defaults';
import {ED25519} from '../modules/ED25519';

export declare namespace Attorney
{
    export interface Options
    {
        encoding?: Encoding;
    }

    export interface Contract
    {
        attributes: object;
        signature: string;
    }
}

export class Attorney
{
    private static _flatten(object: any): any[]
    {
        const flat_map: any[] = [];
        for(const key in object)
        {
            if(object.hasOwnProperty(key))
            {
                const value = object[key];
                if(typeof value === 'object')
                    flat_map.push(...this._flatten(value));
                else
                    flat_map.push(value);
            }
        }

        return flat_map;
    }

    public static redact(attributes: object, signer: ED25519, options?: Attorney.Options): Attorney.Contract
    {
        // @ts-ignore
        const encoding: Attorney.Encoding = (options && options.encoding) || Attorney.Encoding[defaults.buffer_encoding as any] as Attorney.Encoding;

        const paper = this._flatten(attributes).sort();
        return {attributes, signature: signer.sign(paper.join('')).toString(encoding)};
    }

    public static verify(contract: Attorney.Contract, public_key: Buffer, options?: Attorney.Options): boolean
    {
        // @ts-ignore
        const encoding: Attorney.Encoding = (options && options.encoding) || Attorney.Encoding[defaults.buffer_encoding as any] as Attorney.Encoding;

        const paper = this._flatten(contract.attributes).sort();
        return ED25519.verify(paper.join(''), public_key, Buffer.from(contract.signature, encoding));
    }
}

// tslint:disable-next-line:no-namespace
export namespace Attorney
{
    export enum Encoding
    {
        BASE64 = 'base64',
        HEX = 'hex'
    }
}
