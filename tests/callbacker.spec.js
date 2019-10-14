const { syncCallbacker, asyncCallbacker } = require('../src/callbacker.js');

const createRacifiedPromise = testFunc => Promise.race([
  new Promise((res, rej) => setTimeout(() => {
    rej('Youve done something wrong - this occurs if your solution takes over a second.');
  }, 1000)),
  new Promise(res => testFunc(res)),
]);

describe('Part 1: Sync/Async Callbacker', () => {
  describe('syncCallbacker', () => {
    it('should be a function', () => {
      expect(typeof syncCallbacker).toEqual('function');
    });

    it('should take atleast two arguments', () => {
      expect(syncCallbacker.length).toBeGreaterThanOrEqual(2);
    });

    it('should error if either argument is not a functon', () => {
      expect(() => syncCallbacker('a', () => {
      })).toThrow();
      expect(() => syncCallbacker(() => {
      }, 'b')).toThrow();
    });

    it('should error if it receives less then two arguments', () => {
      expect(() => syncCallbacker(() => {
      })).toThrow();
    });

    describe('Functionality', () => {
      let aSpy, bSpy;
      beforeEach(() => {
        aSpy = jest.fn();
        bSpy = jest.fn();
      });

      it('should call both arguments', () => {
        syncCallbacker(aSpy, bSpy);

        expect(aSpy.mock.calls.length).toEqual(1);
        expect(bSpy.mock.calls.length).toEqual(1);
      });

      it('should pass the result of the first argument into the second argument', () => {
        const someRandomNum = Math.random() * 100;

        aSpy = jest.fn(() => someRandomNum);
        bSpy = jest.fn(a => {
        });

        syncCallbacker(aSpy, bSpy);

        // Looks crazy, just means that bSpy received the someRandomNum as its only argument.
        expect(bSpy.mock.calls).toEqual(
          expect.arrayContaining(
            [expect.arrayContaining([someRandomNum])]
          )
        );
      });

      it('should return the value of the final callback as the value of syncCallbacker', () => {
        const someRandomNum = Math.random() * 100;

        aSpy = jest.fn(() => someRandomNum);
        bSpy = jest.fn(a => a * 2);

        expect(syncCallbacker(aSpy, bSpy)).toEqual(someRandomNum * 2);
      });
    });

    xdescribe('Extra Credit syncCallbacker', () => {
      it('can receive any number of functions greater than 2 as an argument', () => {
        const cbs = [() => 1];

        const randomNumOfFuncs = Math.ceil(Math.random() * 7) + 3;

        for (let i = 0; i < randomNumOfFuncs; ++i) {
          cbs.push(a => a * 2);
        }

        expect(syncCallbacker(...cbs)).toEqual(2 ** randomNumOfFuncs);
      });
    });
  });

  describe('asyncCallbacker', () => {
    it('should be a function', () => {
      expect(typeof asyncCallbacker).toEqual('function');
    });

    it('should take atleast two arguments', () => {
      expect(asyncCallbacker.length).toBeGreaterThanOrEqual(2);
    });

    it('should error if either argument is not a functon', () => {
      expect(() => asyncCallbacker('a', () => {
      })).toThrow();
      expect(() => asyncCallbacker(() => {
      }, 'b')).toThrow();
    });

    it('should error if it receives less then two arguments', () => {
      expect(() => asyncCallbacker(() => {
      })).toThrow();
    });

    describe('Functionality', () => {
      it('should call both arguments', () => {
        const aSpy = jest.fn((data, done) => {
          done();
        });
        const bSpy = jest.fn();

        asyncCallbacker(aSpy, bSpy);

        expect(aSpy.mock.calls.length).toEqual(1);
        expect(bSpy.mock.calls.length).toEqual(1);
      });

      it('should pass both arguments two arguments, the second being a "done" function', () => {
        const aSpy = jest.fn((data, done) => {
          done();
        });
        const bSpy = jest.fn();

        asyncCallbacker(aSpy, bSpy);

        expect(aSpy.mock.calls).toEqual(
          expect.arrayContaining(
            [expect.arrayContaining([expect.any(Function)])]
          )
        );
        expect(bSpy.mock.calls).toEqual(
          expect.arrayContaining(
            [expect.arrayContaining([expect.any(Function)])]
          )
        );
      });

      it('should still call B, even when we introduce a setTimeout that delays calling "done"', () => createRacifiedPromise(res => {
        const aSpy = jest.fn((data, done) => {
          setTimeout(() => {
            done();
          }, 50);
        });
        const bSpy = jest.fn(() => {
          // This probably looks weird... We have to wait for this function to be called before testing these functions!
          expect(aSpy.mock.calls).toEqual(
            expect.arrayContaining(
              [expect.arrayContaining([expect.any(Function)])]
            )
          );
          expect(bSpy.mock.calls).toEqual(
            expect.arrayContaining(
              [expect.arrayContaining([expect.any(Function)])]
            )
          );
          res();
        });

        asyncCallbacker(aSpy, bSpy);
      }));

      it('B should be called with the data that A passes into "done"', () => createRacifiedPromise(res => {
        const myRandomNumber = Math.random() * 100;

        const aSpy = jest.fn((data, done) => {
          setTimeout(() => {
            done(myRandomNumber);
          }, 50);
        });
        const bSpy = jest.fn(() => {
          // This probably looks weird... We have to wait for this function to be called before testing these functions!
          expect(aSpy.mock.calls).toEqual(
            expect.arrayContaining(
              [expect.arrayContaining([expect.any(Function)])]
            )
          );
          expect(bSpy.mock.calls).toEqual(
            expect.arrayContaining(
              [expect.arrayContaining([myRandomNumber, expect.any(Function)])]
            )
          );
          res();
        });

        asyncCallbacker(aSpy, bSpy);
      }));
    });

    xdescribe('Extra Credit asyncCallbacker', () => {
      it('can receive any number of functions greater than 2 as an argument', () => createRacifiedPromise(res => {
        const cbs = [(data, done) => setTimeout(() => {
          done(1);
        }, 25)];

        const randomNumOfFuncs = Math.ceil(Math.random() * 7) + 3;

        for (let i = 0; i < randomNumOfFuncs; ++i) {
          cbs.push((data, done) => {
            setTimeout(() => {
              done(data * 2);
            }, 25);
          });
        }

        cbs.push((data) => {
          expect(data).toEqual(2 ** randomNumOfFuncs);
          res();
        });

        asyncCallbacker(...cbs);
      }));
    });
  });
});
