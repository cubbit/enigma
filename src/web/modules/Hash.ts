import {WebFileStream} from '@cubbit/web-file-stream';
import {Duplex} from 'stream';

import {defaults} from '../../defaults';
import {em_array_free, em_array_malloc} from '../utils';

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

        this._context = (self as any).cubbit.SHA256.context();

        this.on('finish', () =>
        {
            const hash = (self as any).cubbit.SHA256.finalize(this._context.byteOffset);
            this.push(Buffer.from(hash));
            this._context = null;
        });
    }

    public _write(chunk: Buffer, _: string, callback: any): void
    {
        try
        {
            const heap_chunk = em_array_malloc((self as any).cubbit, chunk);
            (self as any).cubbit.SHA256.update(this._context.byteOffset, heap_chunk.byteOffset, chunk.length);
            em_array_free((self as any).cubbit, heap_chunk);
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
        const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
        const encoding: Hash.Encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;
        if(typeof message === 'string')
            message = Buffer.from(message, 'utf8');

        return Buffer.from(await self.crypto.subtle.digest({name: algorithm}, message)).toString(encoding);
    }

    public static async digest_file(file: string | File, options?: Hash.Options): Promise<string>
    {
        return new Promise<string>((resolve, reject) =>
        {
            if(typeof file === 'string')
                return reject('Path not supported. First argument must be a File');

            const algorithm: Hash.Algorithm = (options && options.algorithm) || Hash.Algorithm[defaults.hash.algorithm as any] as Hash.Algorithm;
            const encoding = (options && options.encoding) || Hash.Encoding[defaults.hash.encoding as any] as Hash.Encoding;

            if(algorithm !== Hash.Algorithm.SHA256)
                return reject(new Error('Unsupported algorithm'));

            const stream = new HashStream();
            stream.on('error', reject);
            stream.on('finish', () => resolve(stream.read().toString(encoding)));
            WebFileStream.create_read_stream(file).pipe(stream);
        });
    }

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
        SHA256 = 'SHA-256'
    }

    export enum Encoding
    {
        BASE64 = 'base64',
        HEX = 'hex'
    }
}
