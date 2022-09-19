# file-cache

File-based cache for JSON-serializable data.

## Usage

### Standard Usage

```js
import { fileCache } from '@uwdata/file-cache';

// create a new cache that writes to ./.cache
// the cache directory will be created if it does not exist
const cache = fileCache();

// set cache value writes both to in-memory map and to disk
await cache.set('key', { value: true });

// get cache value reads from disk if not found in-memory
const value = await cache.get('key');
// value = { value: true}

// delete cache value from both in-memory map and disk
await cache.delete('key');

// delete cache values and folder from disk
// subsequent use of existing cache instance is ill-advised
await deleteCache();
```

### Custom Usage

```js
import { fileCache, deleteCache } from '@uwdata/file-cache';

// create a new cache with custom directory and time-to-live
const cache = fileCache({
  cacheDir: './.my-cache-dir', // custom cache directory
  defaultTTL: 60 * 1000, // custom time-to-live before expiration
});

// set cache value along with a custom TTL value for the entry
await cache.set('key', { value: true }, 120 * 1000);

// delete cache values and folder from disk
// subsequent use of existing cache instance is ill-advised
await deleteCache('./.my-cache-dir');
```
