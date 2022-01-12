'use strict';

const fs = require('fs-extra');
const glob = require('glob');
const os = require('os');
const path = require('path');
const tar = require('tar');
const aws = require('aws-sdk');

const module_path = path.resolve(__dirname, '../..');
const package_path = path.resolve(module_path, 'package.json');
const package_json = JSON.parse(fs.readFileSync(package_path).toString());
const package_name = package_json.name;
const package_version = package_json.version;
const module_name = package_name.split('/')[1] || package_name;
const bindings_path = path.resolve(module_path, 'build');
const stage_path = path.resolve(module_path, 'build', 'stage');

function _archive()
{
    const platform = process.env.TARGET_PLATFORM || os.platform();
    let arch = process.env.TARGET_ARCH || os.arch();
    const runtime = process.env.TARGET_RUNTIME || 'node';

    if(arch === 'armv7')
        arch = 'arm';

    const filename = `${runtime}-${platform}-${arch}.tar.gz`;

    const tarball_path = path.resolve(stage_path, package_version, arch)
    const tarball = path.resolve(tarball_path, filename);

    return tarball
}

async function pack()
{
    console.log('Packing native node...');

    const tarball = _archive();

    console.log('Creating archive:', tarball);

    fs.ensureDirSync(path.dirname(tarball));

    const file = fs.createWriteStream(tarball);
    const input = glob.sync('Release/*.node', {cwd: bindings_path})
    tar.create({gzip: true, cwd: bindings_path}, input).pipe(file);

    file.once('close', () => console.log('Packed!'));

    file.once('error', (error) =>
    {
        console.error(error.message)
        process.exit(1);
    });
}

async function publish()
{
    console.log('Uploading native node...');

    const tarball = _archive();

    if(process.env.SECRET_ACCESS_KEY && process.env.ACCESS_KEY_ID)
        aws.config.update({secretAccessKey: process.env.SECRET_ACCESS_KEY, accessKeyId: process.env.ACCESS_KEY_ID, region: 'eu-central-1'});

    const s3 = new aws.S3({params: {Bucket: 'cubbit'}});
    s3.putObject({
        Bucket: 'cubbit',
        Key: `${module_name}/${package_version}/${path.basename(tarball)}`,
        Body: fs.readFileSync(tarball),
        ACL: 'public-read'
    }, (error) =>
    {
        if(error)
        {
            console.error(error.message)
            process.exit(1);
        }

        console.log('Uploaded!');
    });
}

module.exports = {pack, publish};
