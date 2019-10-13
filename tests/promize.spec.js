const Promize = require('../src/promize.js');

describe('Promize', () => {
  it('should be able to be constructed into a promize instance', () => {
    const ourFirstPromise = new Promize(() => {});

    expect(ourFirstPromise instanceof Promize).toBe(true);
  });

  it('should error if not passed a function executor', () => {
    expect(() => new Promize()).toThrow();
  });

  test('should have an executor that is passed a resolve function as the first argument', done => {
    new Promize((resolve) => {
      expect(typeof resolve).toBe('function');
      done();
    });
  });

  test('should have an executor that is passed a reject function as the second argument', done => {
    new Promize((resolve, reject) => {
      expect(typeof reject).toBe('function');
      done();
    });
  });

  test('should have no return values (void) for resolve and/or reject to make clear their return values dont matter', done => {
    new Promize((resolve, reject) => {
      expect(resolve()).toBe(undefined);
      expect(reject()).toBe(undefined);
      done();
    });
  });

  test('should call .then after the executor resolves', done => {
    const ourSecondPromise = new Promize((r) => {
      setTimeout(() => {
        r();
      }, 100)
    });

    ourSecondPromise.then(() => {
      expect(true).toBe(true);
      done();
    });
  });

  test('should call .then and pass the value into resolve upon resolution', done => {
    const ourThirdPromise = new Promize((r) => {
      setTimeout(() => {
        r('pancakes');
      }, 100)
    });

    ourThirdPromise.then((val) => {
      expect(val).toBe('pancakes');
      done();
    });
  });

  test('can chain promise chains together', done => {
    const ourFourthPromise = new Promize((r) => {
      setTimeout(() => {
        r('pancakes');
      }, 100)
    });

    ourFourthPromise
      .then((val) => {
        return val;
      })
      .then((val) => {
        expect(val).toBe('pancakes');
        done();
      });
  });

  test('.then should return a promise', done => {
    const testThenableIsAPromize = new Promize((r) => {
      setTimeout(() => {
        r();
      }, 100);
    })
      .then(() => true);

    expect(testThenableIsAPromize instanceof Promize).toBe(true);
    done();
  });

  test('should wait for a promise to resolve in the chain before calling the next .then', done => {
    const ourFifthPromise = new Promize((r) => {
      setTimeout(() => {
        r('pancakes');
      }, 100);
    });

    ourFifthPromise
      .then(() => {
        return new Promize((r) => {
          setTimeout(() => r('waited'), 100);
        });
      })
      .then(val => {
        expect(val).toBe('waited');
        done();
      })
  });

  test('should call catch if rejected', done => {
    const ourSixthPromise = new Promize((res, reject) => {
      setTimeout(() => {
        reject('pancakes');
      }, 100);
    });

    ourSixthPromise
      .catch((e) => {
        expect(true).toBe(true);
        done();
      });
  });

  test('should mark downstream promise rejected if something fails', done => {
    const ourSeventhPromise = new Promize((res) => {
      setTimeout(() => {
        res();
      }, 100);
    });

    ourSeventhPromise
      .then(() => {
        return new Promize((res) => {
          setTimeout(() => {
            res('pancakes');
          }, 100);
        });
      })
      .then((val) => {
        return new Promize((res, rej) => {
          rej();
        })
      })
      .catch((e) => {
        expect(true).toBe(true);
        done();
      });
  });

  test('should call downstream catches if a callback errors', done => {
    const ourFinalPromise = new Promize(() => {
      throw new Error('Oh no!');
    });

    ourFinalPromise
      .catch(e => {
        expect(true).toBe(true);
        done();
      });
  });
});
