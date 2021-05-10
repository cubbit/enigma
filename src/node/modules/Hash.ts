import {createHash, Hash as CryptoHash} from 'crypto';
import {createReadStream} from 'fs';

import {defaults} from '../../defaults';
import {base_x} from '../../common/utils/base_x';

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

        const hash = createHash(algorithm).update(message).digest();

        switch(encoding)
        {
            case Hash.Encoding.BASE58:
                return base_x.make_encoder(base_x.Encoding.BASE58)(hash);

            default:
                return hash.toString(encoding);
        }
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
            stream.on('error', reject);
            stream.on('finish', () =>
            {
                const hash_stream = stream.read();

                switch(encoding)
                {
                    case Hash.Encoding.BASE58:
                        return resolve(base_x.make_encoder(base_x.Encoding.BASE58)(hash_stream));

                    default:
                        return resolve(hash_stream.toString(encoding));
                }
            });

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
        BASE58 = 'base58',
        HEX = 'hex'
    }
}
