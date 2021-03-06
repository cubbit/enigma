"use strict";

const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const module_path = path.resolve(__dirname, '../..');

const openssl_version = '1.0.2q';

async function build()
{
    console.log('Building module...');

    try
    {
        const build_path = path.resolve(module_path, 'build', 'wasm');
        fs.ensureDirSync(build_path);

        const bindings_path = path.resolve(module_path, 'bindings/web');
        const scripts_path = path.resolve(__dirname, 'docker');

        const result = child_process.spawnSync('docker', ['run', '--rm',
            `--volume=${scripts_path.replace(/\\/g, '/')}:/scripts`,
            `--volume=${build_path.replace(/\\/g, '/')}:/out`,
            `--volume=${bindings_path.replace(/\\/g, '/')}:/bindings`,
            '--env', `OPENSSL_VERSION=${openssl_version}`,
            'trzeci/emscripten', 'bash', '/scripts/build.sh'], {stdio: 'inherit', cwd: module_path});
        if(result.status)
            throw new Error(`Unable to build module`);
    }
    catch(error)
    {
        console.error(error);
        process.exit(1);
    }

    console.log('Module built!');
}

module.exports = {build};
