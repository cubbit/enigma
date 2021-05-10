import {WebFileStream} from '@cubbit/web-file-stream';
import {Duplex} from 'stream';

import {defaults} from '../../defaults';
import {em_array_free, em_array_malloc} from '../utils';
import {base_x} from '../../common/utils/base_x';

export declare namespace Hash
{
    export interface Options
    {
        algorithm?: Algorithm;
        encoding?: Encoding;
    }
}

export class HashStream extends Duplex
{
    private _context: any;

    public constructor()
    {
        super();

        this._context = (self as any).enigma.SHA256.context();

        this.on('finish', () =>
        {
            const hash = (self as any).enigma.SHA256.finalize(this._context.byteOffset);
            this.push(Buffer.from(hash));
            this._context = null;
        });
    }

    public _write(chunk: Buffer, _: string, callback: any): void
    {
        try
        {
            const heap_chunk = em_array_malloc((self as any).enigma, chunk);
            (self as any).enigma.SHA256.update(this._context.byteOffset, heap_chunk.byteOffset, chunk.length);
            em_array_free((self as any).enigma, heap_chunk);
            callback();
        }
        catch(error)
        {
            callback(error);
        }
    }

    // tslint:disable-next-line:no-empty
    public _read(_: number): void {}
}

export class Hash
{
    public static async digest(message: string | Buffer, options?: Hash.Options): Promise<string>
    {
        // @ts-ignore
        const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
        // @ts-ignore
        const encoding: Hash.Encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;

        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        const hash = Buffer.from(await self.crypto.subtle.digest({name: algorithm}, message));

        switch(encoding)
        {
            case Hash.Encoding.BASE58:
                return base_x.make_encoder(base_x.Encoding.BASE58)(hash);

            default:
                return hash.toString(encoding);
        }
    }

    public static async digest_file(file: string | File, options?: Hash.Options): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            if(typeof file === 'string')
                return reject('Path not supported. First argument must be a File');

            // @ts-ignore
            const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
            // @ts-ignore
            const encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;

            if(algorithm !== Hash.Algorithm.SHA256)
                return reject(new Error('Unsupported algorithm'));

            const stream = new HashStream();
            stream.on('error', reject);
            stream.on('finish', () => 
            {
                const hash_stream = stream.read();

                switch(encoding)
                {
                    case Hash.Encoding.BASE58:
                        return base_x.make_encoder(base_x.Encoding.BASE58)(hash_stream);

                    default:
                        return resolve(hash_stream.toString(encoding));
                }
            });
            WebFileStream.create_read_stream(file).pipe(stream);
        });
    }

    // @ts-ignore
    public static stream(algorithm: Hash.Algorithm = Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm): HashStream
    {
        if(algorithm !== Hash.Algorithm.SHA256)
            throw new Error('Unsupported algorithm for stream');

        return new HashStream();
    }
}

// tslint:disable-next-line:no-namespace
export namespace Hash
{
    export enum Algorithm
    {
        SHA1 = 'SHA-1',
        SHA256 = 'SHA-256',
    }

    export enum Encoding
    {
        BASE64 = 'base64',
        BASE58 = 'base58',
        HEX = 'hex',
    }
}
