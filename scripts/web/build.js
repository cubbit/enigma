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
        const deps_path = path.resolve(module_path, 'deps');
        fs.ensureDirSync(build_path);
        fs.ensureDirSync(deps_path);

        const bindings_path = path.resolve(module_path, 'bindings/web');
        const scripts_path = path.resolve(__dirname, 'docker');


        const result = child_process.spawnSync('bash', ['-x' ,__dirname + '/build_local.sh'], {stdio: 'inherit', cwd: module_path});

        // const result = child_process.spawnSync('docker', ['run', '--rm',
        //     `--volume=${scripts_path.replace(/\\/g, '/')}:/scripts`,
        //     `--volume=${build_path.replace(/\\/g, '/')}:/out`,
        //     `--volume=${bindings_path.replace(/\\/g, '/')}:/bindings`,
        //     `--volume=${deps_path.replace(/\\/g, '/')}:/deps`,
        //     '--env', `OPENSSL_VERSION=${openssl_version}`,
        //     'trzeci/emscripten-upstream', 'bash', '/scripts/build.sh'], {stdio: 'inherit', cwd: module_path});
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
