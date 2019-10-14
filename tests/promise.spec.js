const { basicPromise, funcPromise, chainedPromise, rejectedPromise} = require('../src/promise.js');

xdescribe('Part 2: Playing with Promises', () => {
  it('expects that the "basicPromise" resolves to the string "basicPromise"', () => {
    return expect(basicPromise).resolves.toEqual('basicPromise');
  });

  it('expects "funcPromise" is a function that returns a promise that resolves to the string "funcPromise"', () => {
    expect(typeof funcPromise).toEqual('function');

    return expect(funcPromise()).resolves.toEqual('funcPromise');
  });

  it('expects "chainedPromise" to be a function that takes a promise as its arguments. It returns a promise that is not the promise passed to it, but that resolves to whatever the passed in promise resolves to', () => {
    const mySuperSecretData = Math.random() * 100;

    const mySuperSecretPromise = new Promise(res => {
      setTimeout(() => {
        res(mySuperSecretData);
      }, 25);
    });

    const mySuperSecretPromiseFunc = () => mySuperSecretPromise;

    expect(typeof chainedPromise).toEqual('function');
    expect(chainedPromise() instanceof Promise).toEqual(true);
    expect(chainedPromise(mySuperSecretPromiseFunc) === mySuperSecretPromise).toEqual(false);

    return expect(chainedPromise(mySuperSecretPromiseFunc)).resolves.toEqual(mySuperSecretData);
  });

  it('expects that "rejectPromise" rejects to an Error of "rejectedPromise"', () => {
    return expect(rejectedPromise()).rejects.toThrow('rejectedPromise');
  });
});
