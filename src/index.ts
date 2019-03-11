// tslint:disable: no-var-requires
let Module: any;

if(typeof self === 'undefined')
    Module = require('./node');
else
    Module = require('./web');

export default Module;
