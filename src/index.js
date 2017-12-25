'use strict';

module.exports = () => {
    console.error(`
        \x1b[31mokwolo : kit not specified, use 'okwolo/{{kit-name}}'\x1b[0m
            ex. \x1b[90mrequire('okwolo/standard')\x1b[0m
    `);
    return null;
};
