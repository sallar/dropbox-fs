import assert from 'assert';

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe('fs.readdir()', function() {
    this.timeout(10000);

    it('Reads root folder', done => {
        fs.readdir('/', (err, result) => {
            assert.equal(err, null);
            assert.ok(Array.isArray(result));
            assert.ok(result.indexOf('list-test') > -1);
            done();
        });
    });

    it('Handles buffer as filePath and cleans URL', done => {
        // This is buffer to test internal methods
        const path = Buffer.from('./', 'utf8');
        fs.readdir(path, (err, result) => {
            assert.equal(err, null);
            done();
        });
    });

    it('Throws error for unknown mode', done => {
        fs.readdir('/', { mode: 'unknown' }, (err, result) => {
            assert.ok(err instanceof Error);
            done();
        });
    });

    it('Reads sub folders', done => {
        fs.readdir('/list-test', (err, result) => {
            assert.equal(err, null);
            assert.ok(Array.isArray(result));
            assert.equal(result.length, 3);
            assert.ok(result.indexOf('test1.txt') > -1);
            assert.ok(result.indexOf('test2.txt') > -1);
            assert.ok(result.indexOf('test3.txt') > -1);
            done();
        });
    });

    it('Returns stat if option provided', done => {
        fs.readdir(
            '/list-test',
            {
                mode: 'stat'
            },
            (err, result) => {
                assert.equal(err, null);
                result.forEach(file => {
                    assert.equal(typeof file.isDirectory, 'function');
                    assert.equal(typeof file.isFile, 'function');
                    assert.equal(typeof file.name, 'string');
                    assert.equal(file.isFile(), true);
                });
                done();
            }
        );
    });
});
