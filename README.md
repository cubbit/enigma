# enigma

A fast, native, environment-agnostic, cryptographic engine for the web

```ts
const aes = new Enigma.AES();
const my_secret = 'My secret';

const encrypted_secret = await aes.encrypt(my_secret);
console.log(encrypted_secret);

/* 
{
    content: <Buffer 16 6e b6 61 1b e0 d9 3a 25>,
    tag: <Buffer 07 cf 9d 9c 53 6a 13 5f 5f 24 75 a3 64 1f bd 89>,
    iv: <Buffer 62 d6 9b 8c bc 23 3c e5 9b 77 30 2e 56 cc f9 35>
}
*/
```

Enigma is a crypto library available both for Node.js platform and for the Web.

## Installation

Enigma is a npm module available through the [npm registry](https://www.npmjs.com/).
Installation is done using the `npm install` command:

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

Before installing, [download and install Node.js](https://nodejs.org/en/download/). Node.js version 8.0 or higher is required (Node.js 11 has not be tested yet).

Enigma is supported on the following platforms.

|         |  x86   | x64 | arm32 | arm64 |
| ------- | ------ | --- | ----- | ----- |
| Linux   | ︎︎︎ ✔︎ | ✔︎  | ✔︎    | ✔︎    |
| macOS   | -      | ✔︎  | -     | -     |
| Windows | ✔︎     | ✔︎  | -     | -     |

## Web

[TODO]

## Usage

[TODO]

## Docs

[TODO]

## How to run tests

To run the test suite, first install the dependencies, then run `npm test`:

```bash
npm install
npm test
```

## How to contribute

Feel free to open issue or a Pull Request to report bugs and suggest new features. Please refer to our [Contributions guidelines](https://github.com/cubbit/enigma/blob/master/CONTRIBUTING.md) for more details about the contribution process.

## License

[MIT](https://github.com/cubbit/enigma/blob/master/LICENSE)
