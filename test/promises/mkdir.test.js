import assert from 'assert';
import { v4 } from 'uuid';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.mkdir() promise', function() {
    this.timeout(10000);

    const dirName = v4();

    it('Creates a folder', async () => {
        const stat = await fs.mkdir(`/mkdir-test/${dirName}`);
        assert.equal(stat.isDirectory(), true);
        assert.equal(stat.name, dirName);
    });

    it('Deletes a folder', () => {
        return fs.rmdir(`/mkdir-test/${dirName}`);
    });
});
