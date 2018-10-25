const {
    assert
} = require('chai');

const {
    Extension
} = require('../extension');

const ext = new Extension();

const {
    workspace
} = require('vscode');

const path = require('path');

suite("Extension Tests", function () {

    test('Testing PreSaveListener',
        done => {
            let t = __dirname;

            path.join()

            assert.equal(true, true);
            done()
        }, err => {
            return;
        }
    )
});