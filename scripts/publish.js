'use strict';

const child_process = require('child_process');
const fs = require('fs-extra');
const glob = require('glob');
const path = require('path');

const module_path = path.resolve(__dirname, '..');
const source_path = path.resolve(module_path, 'src');
const build_path = path.resolve(module_path, 'build');
const dist_path = path.resolve(module_path, 'dist');;

function _clean()
{
    console.log('Cleaning folders...');

    fs.ensureDirSync(dist_path);
    fs.emptyDirSync(dist_path);

    console.log('Cleaned!');
}

function _compile_ts()
{
    console.log('Compiling typescript...');

    const executable = path.resolve(__dirname, '..', 'node_modules/.bin', 'tsc');
    const result = child_process.spawnSync(executable, ['--outDir', dist_path], {shell: true, stdio: 'inherit', cwd: module_path});
    if(result.status)
        throw new Error(`Unable to compile typescript`);

    console.log('Compiled!');
}

function _build_web()
{
    console.log('Building web...');

    const result = child_process.spawnSync('npm', ['run', 'build:web'], {shell: true, stdio: 'inherit', cwd: module_path});
    if(result.status)
        throw new Error(`Unable to build`);

    const files = glob.sync('wasm/*', {cwd: build_path})
    for(const file of files)
        fs.copySync(path.resolve(build_path, file), path.resolve(dist_path, file));

    console.log('Built!');
}

function _npm_package()
{
    console.log('Preparing package.json...');

    const package_path = path.resolve(dist_path, 'package.json');
    const package_json = JSON.parse(fs.readFileSync(path.resolve(module_path, 'package.json')).toString());
    delete package_json.private;
    const keep_scripts = ['install', 'build'];
    const scripts = {};
    for(const script of keep_scripts)
        scripts[script] = package_json.scripts[script];
    package_json.scripts = scripts;
    delete package_json.devDependencies;
    fs.writeFileSync(package_path, JSON.stringify(package_json, null, 4));

    console.log('Prepared!');
}

function _types()
{
    console.log('Copying types...');

    const files = ['index.d.ts'];
    for(const file of files)
        fs.copySync(path.resolve(source_path, file), path.resolve(dist_path, file));

    console.log('Copied!');
}

function _files()
{
    console.log('Copying custom files...');

    const files = ['README.md', 'LICENSE', 'binding.gyp'];
    for(const file of files)
        fs.copySync(path.resolve(module_path, file), path.resolve(dist_path, file));

    console.log('Copied!');
}

function _scripts()
{
    console.log('Copying scripts...');

    const scripts_path = path.resolve(module_path, 'dist', 'scripts');
    fs.ensureDir(scripts_path);
    const scripts = ['node/install.js', 'node/dependencies.js', 'node/shell/prepare.bat', 'node/shell/prepare.sh'];
    for(const script of scripts)
        fs.copySync(path.resolve(module_path, 'scripts', script), path.resolve(scripts_path, script));

    console.log('Copied!');
}

function _bindings_node()
{
    console.log('Copying node bindings...');

    const bindings_path = path.resolve(module_path, 'dist', 'bindings');
    fs.ensureDir(bindings_path);
    fs.copySync(path.resolve(module_path, 'bindings', 'node'), path.resolve(bindings_path, 'node'));

    console.log('Copied!');
}

function _npm_publish()
{
    console.log('Publishing package...');

    let result;

    result = child_process.spawnSync('npm', ['publish', '--access', 'public'], {shell: true, stdio: 'inherit', cwd: dist_path});
    if(result.status)
        throw new Error(`Unable to publish package`);

    console.log('Published!');
}

function pack()
{
    console.log('Packing...');

    _clean();
    _compile_ts();
    _build_web();
    _bindings_node();
    _npm_package();
    _files();
    _types();
    _scripts();

    console.log('Packed!');
}

function publish()
{
    console.log('Publishing...');

    pack();
    _npm_publish();

    console.log('Published!');
}

module.exports = {pack, publish};
