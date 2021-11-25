import assert from 'assert';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.stat() promise', function() {
    this.timeout(10000);

    it('Returns correct stat for a file', async () => {
        const stat = await fs.stat('/list-test/test1.txt');

        assert.ok(typeof stat.isDirectory === 'function');
        assert.ok(!stat.isDirectory());
        assert.ok(stat.isFile());
        assert.ok(stat.name === 'test1.txt');
    });

    it('Returns correct stat for a directory', async () => {
        const stat = await fs.stat('/list-test');

        assert.ok(typeof stat.isDirectory === 'function');
        assert.ok(stat.isDirectory());
        assert.ok(!stat.isFile());
        assert.ok(stat.name === 'list-test');
    });
});
