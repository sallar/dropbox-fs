import assert from 'assert';
import { v4 } from 'uuid';
import pullout from 'pullout';
import stringToStream from 'string-to-stream';

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.createWriteStream()', function() {
    this.timeout(10000);

    const testFileName = `${v4()}.txt`;

    it('Writes a file correctly', done => {
        const name = `/write-test/${testFileName}`;
        const stream = fs.createWriteStream(name);

        stringToStream('testdata')
            .pipe(stream)
            .on('metadata', () => {
                fs.stat(name, (err, stat) => {
                    assert.equal(err, null);
                    assert.equal(stat.isFile(), true);
                    assert.equal(stat.name, testFileName);
                    done();
                });
            });
    });

    it('Deletes a file correctly', done => {
        fs.unlink(`/write-test/${testFileName}`, (err, stat) => {
            assert.equal(err, null);
            done();
        });
    });
});
