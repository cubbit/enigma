# enigma [![Build Status](https://travis-ci.org/cubbit/enigma.svg?branch=master)](https://travis-ci.org/cubbit/enigma)

A fast, native, environment-agnostic, cryptographic engine for the web

```ts
import Enigma from '@cubbit/enigma';

new Enigma.AES().init().then(async (aes: Enigma.AES) =>
{
    const my_secret = 'My secret';

    const cipher = await aes.encrypt(my_secret);
    console.log(cipher);
});

/*
{
    content: <Buffer 16 6e b6 61 1b e0 d9 3a 25>,
    tag: <Buffer 07 cf 9d 9c 53 6a 13 5f 5f 24 75 a3 64 1f bd 89>,
    iv: <Buffer 62 d6 9b 8c bc 23 3c e5 9b 77 30 2e 56 cc f9 35>
}
*/
```

Enigma is a crypto library available both for Node.js platform and for the Web. It relies on OpenSSL to provide the most common cryptographical utilities. In a web environment, Enigma leverages on a [WebAssembly](https://webassembly.org/)-compiled version of OpenSSL to boost performances.

## Installation

Enigma is a npm module available through the [npm registry](https://www.npmjs.com/).
Installation is done both in Node.js and in a web environment using the `npm install` command:

```bash
npm install @cubbit/enigma
```

If you want to work from source, just clone the repo and run the install script as:

```bash
git clone https://github.com/cubbit/enigma.git
cd enigma
npm install
```

## Node.js

Before installing, [download and install Node.js](https://nodejs.org/en/download/). Node.js version 8.0 or higher is required (Node.js 11 has not been tested yet).

Enigma is supported on the following platforms.

|         |  x86   | x64 | arm32 | arm64 |
| ------- | ------ | --- | ----- | ----- |
| Linux   | ︎︎︎ ✔︎ | ✔︎  | ✔︎    | ✔︎    |
| macOS   | -      | ✔︎  | -     | -     |
| Windows | ✔︎     | ✔︎  | -     | -     |

After installing just import `@cubbit/enigma` in your code and you are ready to go.

## Web

Install the library by following the [Installation](#Installation) section. Then, just import `@cubbit/enigma` in your source and use it as you would do on Node.js.

**Important**: Enigma needs a Buffer polyfill in order to work correctly on the web. The default one provided by [webpack](https://webpack.js.org/) is ok. Otherwise you'll need to provide one by yourself.

## Features

Enigma includes the following cryptographical utilities:

- **Hashing algorithms ([SHA256](https://wikipedia.org/wiki/Secure_Hash_Algorithm))**
- **Simmetric encryption algorithms ([AES256](https://wikipedia.org/wiki/Advanced_Encryption_Standard))**
- **Asymmetric encryption algorithms ([RSA](https://en.wikipedia.org/wiki/RSA_(cryptosystem)), [ECC](https://en.wikipedia.org/wiki/Elliptic-curve_cryptography))**
- **Misc utilities (Random, [Key derivation](https://en.wikipedia.org/wiki/Key_derivation_function) algorithms)**

Please refer to the [API](#API) section to discover more about how to use each of them

## Examples

### Hashing

```ts
import Enigma from '@cubbit/enigma';

const message = 'Hello world';
const hash = Enigma.Hash.digest(message);

console.log(hash); // A591A6D40BF420404A011733CFB7B190D62C65BF0BCDA32B57B277D9AD9F146E
```

### Encrypt with AES

```ts
import Enigma from '@cubbit/enigma';

new Enigma.AES().init().then(async (aes: Enigma.AES) =>
{
    const my_secret = 'My secret';

    const cipher = await aes.encrypt(my_secret);
    console.log(cipher);
});

/*
{
    content: <Buffer 16 6e b6 61 1b e0 d9 3a 25>,
    tag: <Buffer 07 cf 9d 9c 53 6a 13 5f 5f 24 75 a3 64 1f bd 89>,
    iv: <Buffer 62 d6 9b 8c bc 23 3c e5 9b 77 30 2e 56 cc f9 35>
}
*/
```

### Encrypt a file using AES stream

When encrypting a big file you may encounter browser limitations or memory issues. The AES stream class is design to overcome these problems.

```ts
// On Node.js
import {createReadStream} from 'fs';
import Enigma from '@cubbit/enigma';

const file_stream = fs.createReadStream('my_secret_image.png');
new Enigma.AES().init().then((aes: Enigma.AES) =>
{
    const iv = Enigma.Random.bytes(16);
    const aes_stream = aes.encrypt_stream(iv);

    aes_stream.once('finish', () => console.log('File encrypted'));

    file_stream.pipe(aes_stream);
});

// On the Web
import Enigma from '@cubbit/enigma';
import WebFileStream from '@cubbit/web-file-stream';

const file = new File(); // You can get this File object through an file input tag
const file_stream = WebFileStream.create_read_stream(file);

new Enigma.AES().init().then((aes: Enigma.AES) =>
{
    const iv = Enigma.Random.bytes(16);
    const aes_stream = aes.encrypt_stream(iv);

    aes_stream.once('finish', () => console.log('File encrypted'));

    file_stream.pipe(aes_stream);
});
```

### Decrypt with AES

```ts
import Enigma from '@cubbit/enigma';

const existing_key = /*...*/
const aes = new Enigma.AES().init({key: existing_key}).then(async (aes: Enigma.AES =>
{
    const message = aes.decrypt(my_secret).toString();
    console.log(message); // "My secret"
});

```

### Generate a RSA keypair

```ts
import Enigma from '@cubbit/enigma';

const keypair = Enigma.RSA.create_keypair();
```

### Encrypt and decrypt with RSA

```ts
import Enigma from  '@cubbit/enigma';

const message = 'My secret';
new Enigma.RSA().init().then(async (rsa: Enigma.RSA) =>
{
    const encrypted = await Enigma.RSA.encrypt(message, rsa.keypair.public_key);
    console.log(encrypted);

    /*
    <Buffer 7c 01 29 9e 8e 8a 5c a0 ad 28 5a 19 b4 97 43 96 ca 49 0f 73 f9 bf 4d 27 7a 01 c7 d8 11 b5 8f c4 1e 69 c1 cc ef a2 74 03 8f 04 bc 0e 3d c2 4d 89 c4 10 ... >
    */

    const decrypted = (await rsa.decrypt(encrypted)).toString();
    console.log(decrypted); // "My secret"
});
```

### Generate a ECC keypair

```ts
import Enigma from '@cubbit/enigma';

const keypair = Enigma.ED25519.create_keypair();
```

### Sign and verify message with ECC

```ts
import Enigma from '@cubbit/enigma';

const message = 'To be signed';
const ecc = new Enigma.ED25519();
const signature = ecc.sign(message);

Enigma.ED25519.verify(message, ecc.keypair.public_key, signature).then(console.log) // true
```

### Perform a key derivation with pbkdf2

```ts
import Enigma from '@cubbit/enigma';

const message = 'Original message';
const salted_key = await Enigma.KeyDerivation.pbkdf2(message);
```

### Sign javascript objects with the Attorney tool

```ts
import Enigma from '@cubbit/enigma';

const object = {message: 'To be signed'};
const ecc = new Enigma.ED25519();

const contract = Enigma.Attorney.redact(object, ecc);
const is_valid = Enigma.Attorney.verify(contract, ecc.keypair.public_key);

console.log(is_valid); // true
```

### Generate Random values

```ts
import Enigma from '@cubbit/enigma';

Enigma.init().then(async () =>
{
    const random_int4 = Enigma.Random.integer(32);
    const random_bytes = Enigma.Random.bytes(32);
});
```

## How to rebuild the bindings

To build the project's bindings just run the following command after cloning the repository:

```bash
npm run build
npm run build:web
```

### Prerequisites

- [perl](http://strawberryperl.com/) required to build OpenSSL on Windows
- [docker](https://www.docker.com/) required for the web build

## How to run tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
```

## How to contribute

Feel free to open an issue or a pull request to report bugs and suggest new features. Please refer to our [Contributions guidelines](https://github.com/cubbit/enigma/blob/master/CONTRIBUTING.md) for more details about the contribution process.

## License

[MIT](https://github.com/cubbit/enigma/blob/master/LICENSE)
