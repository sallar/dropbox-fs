import assert from 'assert';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.rename() promise', function() {
    this.timeout(10000);

    it('Renames correctly', async () => {
        await fs.rename('/rename-test/before.txt', '/rename-test/after.txt');

        const content = await fs.readFile('/rename-test/after.txt', 'utf8');

        assert.ok(content === 'one\n');

        await fs.rename('/rename-test/after.txt', '/rename-test/before.txt');
    });
});
