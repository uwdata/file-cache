import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { mkdir, rm, readFile, writeFile } from 'node:fs/promises';

const DEFAULT_CACHE_DIR = './.cache';
const DEFAULT_TTL = 1000 * 60 * 60 * 24 * 15; // 15 days

export function deleteCache(cacheDir = DEFAULT_CACHE_DIR) {
  return rm(cacheDir, { recursive: true, force: true });
}

export async function fileCache({
  cacheDir = DEFAULT_CACHE_DIR,
  defaultTTL = DEFAULT_TTL
} = {}) {
  const md5 = key => createHash('md5').update(key).digest('hex');
  const local = new Map;

  await mkdir(cacheDir, { recursive: true });

  function file(key) {
    return join(cacheDir, md5(key));
  }

  function _delete(key) {
    local.delete(key);
    return rm(file(key), { recursive: true, force: true });
  }

  return {
    async get(key) {
      try {
        let entry;
        if (local.has(key)) {
          entry = local.get(key);
        } else {
          entry = JSON.parse(await readFile(file(key), 'utf8'));
        }

        if (entry?.expires < Date.now()) {
          _delete(key);
          entry = null;
        }
        return entry?.data;
      } catch (err) {
        return;
      }
    },
    set(key, data, ttl = defaultTTL) {
      const entry = { data, expires: Date.now() + ttl };
      local.set(key, entry);
      return writeFile(file(key), JSON.stringify(entry), 'utf8');
    },
    delete: _delete
  };
}
