import assert from 'assert';
import pullout from 'pullout';

const fs = require('../../src/promises')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.createReadStream() promise', function() {
    this.timeout(10000);

    it('Reads a file correctly', done => {
        const stream = fs.createReadStream('/list-test/test1.txt');
        pullout(stream, (err, result) => {
            assert.equal(err, null);
            assert.ok(result instanceof Buffer);
            assert.equal(result.toString('utf8'), 'one\n');
            done();
        });
    });
});
