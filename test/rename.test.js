import assert from "assert";

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe("fs.rename()", function() {

    this.timeout(10000);

    it("Renames correctly", (done) => {
        fs.rename('/rename-test/before.txt', '/rename-test/after.txt', (moveErr) => {
            assert.equal(moveErr, null);
            fs.readFile('/rename-test/after.txt', 'utf8', (err, content) => {
                assert.equal(content, 'one\n');
                fs.rename('/rename-test/after.txt', '/rename-test/before.txt', (moveBackErr) => {
                    assert.equal(moveBackErr, null);
                    done();
                })
            });
        });
    });
    
});
