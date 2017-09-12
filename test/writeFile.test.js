import assert from "assert";
import { v4 } from "uuid";

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe("fs.writeFile()", function() {

    this.timeout(10000);

    const testFileName = `${v4()}.txt`;

    it("Writes a file correctly", (done) => {
        fs.writeFile(`/write-test/${testFileName}`, 'testdata', 'utf8', (err, stat) => {
            assert.equal(err, null);
            assert.equal(stat.isFile(), true);
            assert.equal(stat.name, testFileName);
            done();
        });
    });

    it("Overwrite throws error when disabled", (done) => {
        fs.writeFile(`/write-test/${testFileName}`, 'testdata2', {
            overwrite: false
        }, (err, stat) => {
            assert.equal(typeof err, 'object');
            done();
        });
    });

    it("Overwrites and sets encoding", (done) => {
        fs.writeFile(`/write-test/${testFileName}`, 'dHdvCg==', {
            encoding: 'base64',
            overwrite: true
        }, (err, stat) => {
            assert.equal(err, null);
            assert.equal(stat.isFile(), true);
            assert.equal(stat.name, testFileName);
            fs.readFile(`/write-test/${testFileName}`, 'utf8', (err, content) => {
                assert.equal(err, null);
                assert.equal(content, 'two\n');
                done();
            });
        });
    });

    it("Deletes a file correctly", (done) => {
        fs.unlink(`/write-test/${testFileName}`, (err, stat) => {
            assert.equal(err, null);
            done();
        });
    });

});
