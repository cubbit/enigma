'use strict';

const child_process = require('child_process');
const fs = require('fs-extra');
const https = require('https');
const os = require('os');
const path = require('path');
const tar = require('tar');

const module_path = path.resolve(__dirname, '../..');
const package_path = path.resolve(module_path, 'package.json');
const package_json = JSON.parse(fs.readFileSync(package_path).toString());
const package_name = package_json.name;
const package_version = package_json.version;
const module_name = package_name.split('/')[1] || package_name;
const bindings_path = path.resolve(module_path, 'build');
const stage_path = path.resolve(module_path, 'build', 'stage');

function _build()
{
    const result = child_process.spawnSync('npm', ['run', 'build'], {shell: true, stdio: 'inherit', cwd: module_path});
    if(result.status)
        return false;
    return true;
}

function install()
{
    return new Promise((resolve, reject) =>
    {
        if(process.env.ENIGMA_FORCE_BUILD)
        {
            if(_build())
                return resolve();
            return reject(`Unable to install`);
        }

        const platform = os.platform();
        const arch = os.arch();
        let runtime = process.env.npm_config_runtime === "electron" && platform === 'win32' ? 'electron' : 'node';
        if(runtime === 'electron')
            runtime = `${runtime}-${process.env.npm_config_target.split('.').slice(0, 2).join('.')}`
        const filename = `${runtime}-${platform}-${arch}.tar.gz`;
        const url = `https://s3.eu-central-1.amazonaws.com/cubbit/${module_name}/${package_version}/${filename}`;

        https.get(url, (response) =>
        {
            if(response.statusCode === 200)
            {
                const tarball_path = path.resolve(stage_path, package_version)
                const tarball = path.resolve(tarball_path, filename);
                fs.ensureDirSync(tarball_path);

                const stream = fs.createWriteStream(tarball)
                stream.on('close', () =>
                {
                    fs.ensureDirSync(bindings_path);
                    tar.extract({
                        file: tarball,
                        cwd: bindings_path
                    }).then(resolve).catch(reject);
                });
                stream.on('error', reject);

                response.pipe(stream);
            }
            else
            {
                if(_build())
                    return resolve();
                return reject(`Unable to install`);
            }
        });
    });
}

module.exports = {install};
