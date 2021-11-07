import assert from 'assert';
import { v4 } from 'uuid';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.writeFile() promise', function() {
    this.timeout(10000);

    const testFileName = `${v4()}.txt`;

    it('Writes a file correctly', async () => {
        const stat = await fs.writeFile(
            `/write-test/${testFileName}`,
            'testdata'
        );

        assert.ok(stat.isFile());
        assert.ok(stat.name === testFileName);
    });

    it('Overwrite throws error when disabled', async () => {
        try {
            await fs.writeFile(`/write-test/${testFileName}`, 'testdata2', {
                overwrite: false
            });
        } catch (_) {
            assert.ok(true);
        }
    });

    it('Overwrites and sets encoding', async () => {
        const options = {
            encoding: 'base64',
            overwrite: true
        };

        const stat = await fs.writeFile(
            `/write-test/${testFileName}`,
            'dHdvCg==',
            options
        );

        assert.ok(stat.isFile());
        assert.ok(stat.name === testFileName);
        const content = await fs.readFile(
            `/write-test/${testFileName}`,
            'utf8'
        );
        assert.ok(content === 'two\n');
    });

    it('Deletes a file correctly', () => {
        return fs.unlink(`/write-test/${testFileName}`);
    });
});
