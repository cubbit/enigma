"use strict";

const child_process = require('child_process');
const fs = require('fs-extra');
const os = require('os');
const path = require('path');

const module_path = path.resolve(__dirname, '../..');

const openssl_version = '1.0.2q';

(function dependencies()
{
    try
    {
        const dependencies_path = path.resolve(module_path, 'dependencies');
        if(fs.existsSync(path.resolve(dependencies_path, 'ed25519')) && fs.existsSync(path.resolve(dependencies_path, 'openssl')) && !process.env.FORCE_DEPENDENCIES)
            return;

        fs.ensureDirSync(dependencies_path);
        fs.emptyDirSync(dependencies_path);

        let result;
        const scripts_shell_path = path.resolve(__dirname, 'shell');

        const env = Object.assign({}, process.env);
        env.OPENSSL_VERSION = openssl_version;

        const platform = os.platform();
        const arch = process.env.npm_config_arch || os.arch();

        let command;
        if(platform === 'win32')
        {
            command = path.resolve(scripts_shell_path, 'prepare.bat');

            switch(arch)
            {
                case 'x64':
                    env.OPENSSL_COMPILER = 'VC-WIN64A';
                    break;

                default:
                    throw new Error(`Unsupported arch: ${arch} - ${platform}`)
            }
        }
        else if(platform === 'linux')
        {
            command = path.resolve(scripts_shell_path, 'prepare.sh');

            switch(arch)
            {
                case 'x32':
                    env.OPENSSL_COMPILER = 'linux.x32';
                    break;
                case 'x64':
                    env.OPENSSL_COMPILER = 'linux-x86_64';
                    break;
                case 'arm':
                    env.OPENSSL_COMPILER = 'linux-generic32';
                    break;
                case 'arm64':
                    env.OPENSSL_COMPILER = 'linux-aarch64';
                    break;

                default:
                    throw new Error(`Unsupported arch: ${arch} - ${platform}`)
            }
        }
        else if(platform === 'darwin')
        {
            command = path.resolve(scripts_shell_path, 'prepare.sh');

            switch(arch)
            {
                case 'x64':
                    env.OPENSSL_COMPILER = 'darwin64-x86_64-cc';
                    break;

                default:
                    throw new Error(`Unsupported arch: ${arch} - ${platform}`)
            }
        }
        else
            throw new Error(`Unsupported platform: ${platform}`);

        for(const key in env)
        {
            if(key.match(/(make|npm|target)/gi))
                delete env[key];
        }

        fs.chmodSync(command, '775');
        result = child_process.spawnSync(command, [], {stdio: 'inherit', cwd: dependencies_path, env});
        if(result.status)
            throw new Error(`Unable to prepare module`);
    }
    catch(error)
    {
        console.error(error);
        process.exit(1);
    }
})();
