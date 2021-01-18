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
    public static async digest(message: string | Buffer, options?: Hash.Options): Promise<string>
    {
        // @ts-ignore
        const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
        // @ts-ignore
        const encoding: Hash.Encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;
        return createHash(algorithm).update(message).digest().toString(encoding);
    }

    public static digest_file(file: string | File, options?: Hash.Options): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            if(typeof file !== 'string')
                return reject('File not supported. First argument must be a path');

            // @ts-ignore
            const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
            // @ts-ignore
            const encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;

            const stream = createHash(algorithm);
            stream.setEncoding(encoding);
            stream.on('error', reject);
            stream.on('finish', () => resolve(stream.read().toString()));

            const read_stream = createReadStream(file);
            read_stream.on('error', reject);

            read_stream.pipe(stream);
        });
    }

    // @ts-ignore
    public static stream(algorithm: Hash.Algorithm = Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm): CryptoHash
    {
        return createHash(algorithm);
    }
}

export namespace Hash
{
    export enum Algorithm
    {
        SHA1 = 'sha1',
        SHA256 = 'sha256'
    }

    export enum Encoding
    {
        BASE64 = 'base64',
        HEX = 'hex'
    }
}
