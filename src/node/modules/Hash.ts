import {createHash, Hash as CryptoHash} from 'crypto';
import {createReadStream} from 'fs';

import {defaults} from '../../defaults';

export declare namespace Hash
{
    export interface Options
    {
        algorithm?: Algorithm;
        encoding?: Encoding;
    }
}

export class Hash
{
    public static digest(message: string | Buffer, options?: Hash.Options): string
    {
        const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
        const encoding: Hash.Encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;
        return createHash(algorithm).update(message).digest().toString(encoding);
    }

    public static digest_file(file: string | File, options?: Hash.Options): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            if(typeof file !== 'string')
                return reject('File not supported. First argument must be a path');

            const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
            const encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;

            const stream = createHash(algorithm);
            stream.setEncoding(encoding);
            stream.on('error', reject);
            stream.on('finish', () => resolve(stream.read().toString()));
            createReadStream(file).pipe(stream);
        });
    }

    public static stream(algorithm: Hash.Algorithm = Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm): CryptoHash
    {
        return createHash(algorithm);
    }
}

export namespace Hash
{
    export enum Algorithm
    {
        SHA256 = 'sha256'
    }

    export enum Encoding
    {
        BASE64 = 'base64',
        HEX = 'hex'
    }
}
