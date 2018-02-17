import assert from 'assert';
import proxyquire from 'proxyquire';
import { spy, stub } from 'sinon';

// Use proxyquire to inject our own stub FS factory so we don't have to hit Dropbox
const fsFactory = stub();
const readonly = proxyquire('../src/readonly', {
    './index': fsFactory
});

describe('readonly', function() {
    describe('#ctor', function() {
        beforeEach(() => fsFactory.returns({}));
        afterEach(() => fsFactory.reset());

        it('passes on `apiKey`', function() {
            const apiKey = 'dummy';
            readonly({ apiKey });
            assert(fsFactory.alwaysCalledWithMatch({ apiKey }));
        });

        it('passes on `client`', function() {
            const client = {};
            readonly({ client });
            assert(fsFactory.alwaysCalledWithMatch({ client }));
        });
    });

    describeSafeMethod('readdir', 'dummypath');
    describeSafeMethod('readFile', 'dummypath');
    describeSafeMethod('stat', 'dummypath');

    function describeSafeMethod(name, ...args) {
        describe(`#${name}`, () => {
            // Stub out the corresponding method on the normal API
            const fsMethod = spy();
            beforeEach(() => fsMethod.resetHistory());

            beforeEach(() => fsFactory.returns({ [name]: fsMethod }));
            afterEach(() => fsFactory.reset());

            it('makes call to fs', () => {
                const readonlyFs = readonly({ client: {} });

                readonlyFs[name](...args, noopCallback);

                assert(fsMethod.alwaysCalledWithExactly(...args, noopCallback));
            });
        });
    }

    describeDangerousMethod('mkdir', 'dummypath');
    describeDangerousMethod('rename', 'dummypath', 'dummypath');
    describeDangerousMethod('rmdir', 'dummypath');
    describeDangerousMethod('unlink', 'dummypath');
    describeDangerousMethod('writeFile', 'dummypath', null);

    function describeDangerousMethod(name, ...args) {
        describe(`#${name}`, () => {
            // Stub out the corresponding method on the normal API
            const fsMethod = spy();
            beforeEach(() => fsMethod.resetHistory());

            beforeEach(() => fsFactory.returns({ [name]: fsMethod }));
            afterEach(() => fsFactory.reset());

            it('does not call fs', () => {
                const readonlyFs = readonly({ client: {} });

                readonlyFs[name](...args, noopCallback);

                assert.equal(fsMethod.called, false);
            });

            it('returns an error', () => {
                const readonlyFs = readonly({ client: {} });

                const callback = spy();
                readonlyFs[name](...args, callback);

                assert(
                    callback.alwaysCalledWithExactly(
                        `${name} is not supported in read-only mode`
                    )
                );
            });
        });
    }
});

const noopCallback = () => {};
