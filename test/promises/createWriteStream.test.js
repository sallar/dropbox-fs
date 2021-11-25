import assert from 'assert';
import { v4 } from 'uuid';
import stringToStream from 'string-to-stream';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.createWriteStream() promise', function() {
    this.timeout(10000);

    const testFileName = `${v4()}.txt`;

    it('Writes a file correctly', done => {
        const name = `/write-test/${testFileName}`;
        const stream = fs.createWriteStream(name);

        stringToStream('testdata')
            .pipe(stream)
            .on('metadata', async () => {
                try {
                    const stat = await fs.stat(name);
                    assert.equal(stat.isFile(), true);
                    assert.equal(stat.name, testFileName);
                    done();
                } catch (error) {
                    done(error);
                }
            });
    });

    it('Deletes a file correctly', () => {
        return fs.unlink(`/write-test/${testFileName}`);
    });
});
