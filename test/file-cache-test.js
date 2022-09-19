import assert from 'node:assert';
import { fileCache, deleteCache } from '../src/file-cache.js';

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

describe('file-cache', () => {
  describe('default cache', function () {
    const key = 'my_key';
    const value1 = { foo: 1, bar: false, baz: ['foo'] };
    const value2 = { foo: 2, bar: true,  baz: ['bop'] };

    let cacheA;
    let cacheB;

    before(async () => {
      cacheA = await fileCache();
      cacheB = await fileCache();
    });

    after(async () => {
      await deleteCache();
    })

    it('can read and write cache values', async () => {
      // cache can read non-existent values
      assert.deepStrictEqual(await cacheA.get(key), undefined);

      // cache can write and read values
      await cacheA.set(key, value1);
      assert.deepStrictEqual(await cacheA.get(key), value1);

      // cache can overwrite values
      await cacheA.set(key, value2);
      assert.deepStrictEqual(await cacheA.get(key), value2);

      // a different cache over same files gets the same value
      assert.deepStrictEqual(await cacheB.get(key), value2);
    });
  });

  describe('custom cache', function () {
    const key = 'custom_key';
    const value = { foo: false, bar: 'who', baz: [3.14] };

    let cacheA;
    let cacheB;

    before(async () => {
      cacheA = await fileCache({ cacheDir: './.my_cache' });
      cacheB = await fileCache();
    });

    after(async () => {
      await deleteCache('./.my_cache');
      await deleteCache();
    })

    it('can read and write cache values', async () => {
      // cache can write and read values
      await cacheA.set(key, value);
      assert.deepStrictEqual(await cacheA.get(key), value);

      // a different cache over different files does not get the same value
      assert.deepStrictEqual(await cacheB.get(key), undefined);
    });
  });

  describe('time-to-live', function () {
    const key = 'ttl_key';
    const value = { foo: false, bar: 'who', baz: [3.141] };

    let cacheA;

    before(async () => {
      cacheA = await fileCache({ defaultTTL: 30 });
    });

    after(async () => {
      await deleteCache();
    })

    it('supports default time-to-live values', async () => {
      // set and read cache value
      await cacheA.set(key, value);
      assert.deepStrictEqual(await cacheA.get(key), value);

      // cache value should expire
      await wait(31);
      assert.deepStrictEqual(await cacheA.get(key), undefined);
    });

    it('supports custom time-to-live values', async () => {
      // set and read cache value
      await cacheA.set(key, value, 40);
      await wait(31);
      assert.deepStrictEqual(await cacheA.get(key), value);

      // cache value should expire
      await wait(10);
      assert.deepStrictEqual(await cacheA.get(key), undefined);
    });
  });
});
