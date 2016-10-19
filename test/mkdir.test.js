import assert from "assert";
import { v4 } from "uuid";

const fs = require('../src/index')({
    apiKey: process.env.DROPBOX_API_KEY
});

describe("fs.mkdir()", function() {

    this.timeout(10000);

    const dirName = v4();

    it("Creates a folder", (done) => {
        fs.mkdir(`/mkdir-test/${dirName}`, (err, stat) => {
            assert.equal(err, null);
            assert.equal(stat.isDirectory(), true);
            assert.equal(stat.name, dirName);
            done();
        });
    });

    it("Deletes a folder", (done) => {
        fs.rmdir(`/mkdir-test/${dirName}`, (err) => {
            assert.equal(err, null);
            done();
        });
    });

});
