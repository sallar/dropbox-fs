import assert from 'assert';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.readFile() promise', function() {
    this.timeout(10000);

    it('Reads a file correctly', async () => {
        const result = await fs.readFile('/list-test/test1.txt');
        assert.ok(result instanceof Buffer);
        assert.ok(result.toString('utf8') === 'one\n');
    });

    it('Reads a file correctly with options', async () => {
        const result = await fs.readFile('/list-test/test2.txt', {
            encoding: 'base64'
        });
        assert.ok(typeof result === 'string');
        assert.ok(result === 'dHdvCg==');
    });

    it('Reads a file correctly with utf-8', async () => {
        const result = await fs.readFile('/utf8-test/utf8.txt', {
            encoding: 'utf8'
        });

        assert.ok(typeof result === 'string');
        assert.ok(result === 'brök');
    });
});
