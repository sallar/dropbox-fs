import assert from 'assert';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.readdir() promise', function() {
    this.timeout(10000);

    it('Reads root folder', async () => {
        const result = await fs.readdir('/');
        assert.ok(Array.isArray(result));
        assert.ok(result.indexOf('list-test') > -1);
    });

    it('Handles buffer as filePath and cleans URL', () => {
        const path = Buffer.from('./', 'utf8');
        return fs.readdir(path);
    });

    it('Throws error for unknown mode', async () => {
        try {
            await fs.readdir('/', { mode: 'unknown' });
        } catch (error) {
            assert.ok(error instanceof Error);
        }
    });

    it('Reads sub folders', async () => {
        const result = await fs.readdir('/list-test');
        assert.ok(Array.isArray(result));
        assert.ok(result.length === 3);
        assert.ok(result.indexOf('test1.txt') > -1);
        assert.ok(result.indexOf('test2.txt') > -1);
        assert.ok(result.indexOf('test3.txt') > -1);
    });

    it('Returns stat if option provided', async () => {
        const result = await fs.readdir('/list-test', {
            mode: 'stat'
        });
        result.forEach(file => {
            assert.ok(typeof file.isDirectory === 'function');
            assert.ok(typeof file.isFile === 'function');
            assert.ok(typeof file.name === 'string');
            assert.ok(file.isFile());
        });
    });
});
