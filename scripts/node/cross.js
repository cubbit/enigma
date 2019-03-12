"use strict";

const child_process = require('child_process');
const fs = require('fs-extra');
const path = require('path');

const module_path = path.resolve(__dirname, '../..');

async function cross()
{
    console.log('Crosscompiling module...');

    try
    {
        const arch = process.env.TARGET_ARCH;
        if(!arch)
            throw new Error('TARGET_ARCH is required to crosscompile')

        let container;
        switch(arch)
        {
            case "arm64":
                container = 'dockcross/linux-arm64'
                break;
            case "arm":
                container = 'dockcross/linux-armv7'
                break;

            default:
                throw new Error(`Unsupported arch: ${arch}`)
        }

        let result = child_process.spawnSync('docker', ['run', '--rm',
            `--volume=${module_path.replace(/\\/g, '/')}:/module`,
            '--env', `TARGET_ARCH=${arch}`,
            container, 'bash', '/module/scripts/docker/cross.sh'], {stdio: 'inherit', cwd: module_path});
        if(result.status)
            throw new Error(`Unable to cross module`);

        if(process.env.SKIP_UPLOAD)
            return;

        result = child_process.spawnSync('npm', ['run', 'binary:publish'], {stdio: 'inherit', cwd: module_path});
        if(result.status)
            throw new Error(`Unable to upload cross`);
    }
    catch(error)
    {
        console.error(error);
        process.exit(1);
    }

    console.log('Module crosscompiled!');
}

module.exports = {cross};
