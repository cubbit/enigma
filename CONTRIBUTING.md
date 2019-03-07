# Contributing to enigma

The following is a set of guidelines for contributing to enigma, which is hosted in the Cubbit Organization on GitHub. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request as well.

## Vocabulary

* A **Contributor** is any individual creating or commenting on an issue or pull request.
* A **Committer** is a subset of contributors who have been given write access to the repository.
* A **TC (Technical Committee)** is a group of committers representing the required technical expertise to resolve rare disputes.

## How to contribute in Issues

Feel free to open an issue for any question or problem you may have. Committers or TC may redirect you to other repositories, ask for additional clarifications, and add appropriate metadata before the issue is addressed.

Please be nice and respectful. Every participant is expected to follow our [Code of Conduct](https://github.com/cubbit/enigma/blob/master/CODE_OF_CONDUCT.md).

## Contributions

This project follows the [git flow](https://github.com/nvie/gitflow) workflow. Any change to resources must be through Pull Requests (PR). This applies to documentation, code, binaries, bindings, etc. Even TC or long therm committers are required to use pull requests. Target your pull request on develop branch. Other pull request won't be accepted. No pull request can be merged without being reviewed first by at least one Committeer.

## Code style

Cubbit's codebase strives to be consistent in its use of language and idioms.

### General rules for Typescript/Javascript

* Allman style is enforced for indentation and braces positioning.

```js
while (x === y)
{
    something();
    somethingelse();
}

finalthing();
```

* Snake case for variable and method declarations

```js
const example_constant = 3;

function empty_buffer(buffer)
{
    write_all(buffer, 0);
}
```

* CamelCase for class and interface declarations

```ts
class CryptoManager
{
    constructor(key)
    {
        // initialize
    }
}

```

* Trailing underscores for private members

```ts
class CryptoManager
{
    private _keychain;
    private _buffer;

    constructor(keychain)
    {
        this._keychain = keychain;
        this._buffer = new Buffer(0);
    }
}
```

* Operators need to be separated by spaces (e.g. `const a = b` instead of `const a=b`)
* Semicolons are mandatory
* Braces are discouraged if the statement body only has one line.

```js
if(error)
    return;

```

instead of

```js
if(error)
{
    return;
}
```

* Single quotes for strings
