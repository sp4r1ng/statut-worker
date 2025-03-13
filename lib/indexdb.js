/**
 * File: ./lib/indexdb.js
 * A simple wrapper for working with IndexedDB.
 * @module IndexedDb
 */

let db = null;

/**
 * Get the database instance, initializing it if necessary.
 * @function getDb
 * @returns {Promise<IDBDatabase>} A promise that resolves to the IndexedDB instance.
 */
async function getDb() {
    if (db) {
        return db;
    }
    return await initDb('locky', 1);
}

/**
 * Initialize the IndexedDB database.
 * @function initDb
 * @param {string} dbname - The name of the database.
 * @param {number} version - The version of the database.
 * @returns {Promise<IDBDatabase>} A promise that resolves to the initialized database.
 */
async function initDb(dbname, version) {
    return new Promise((resolve, reject) => {
        const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

        if (!indexedDB) {
            console.error('IndexedDB: not available on your browser');
            reject('IndexedDB not available');
            return;
        }

        const request = indexedDB.open(dbname, version);

        request.onerror = (event) => {
            console.error('IndexedDB: cannot open the database');
            reject(event);
        };

        request.onupgradeneeded = (event) => {
            const oldVersion = event.oldVersion;
            console.log('IndexedDB: database upgrade, old version:', oldVersion);
            const db = request.result;
            if (oldVersion <= 0) {
                db.createObjectStore('keyStore');
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };
    });
}

/**
 * Store a value in the database under the specified key.
 * @function set
 * @param {string} key - The key under which the value will be stored.
 * @param {*} value - The value to store.
 * @returns {Promise<void>} A promise that resolves when the value is stored.
 * @throws {Error} If the value cannot be deleted.
 */
export async function set(key, value) {
    return new Promise((resolve, reject) => {
        getDb().then((db) => {
            const transaction = db.transaction(['keyStore'], 'readwrite');

            transaction.onerror = (event) => {
                reject(event);
            };

            const objectStore = transaction.objectStore('keyStore');
            const request = objectStore.put(value, key);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = (event) => {
                reject(event);
            };
        }).catch(reject);
    });
}

/**
 * Retrieve a value from the database by its key.
 * @function get
 * @param {string} key - The key of the value to retrieve.
 * @returns {Promise<*>} A promise that resolves to the retrieved value.
 * @throws {Error} If the value cannot be deleted.
 */
export async function get(key) {
    return new Promise((resolve, reject) => {
        getDb().then((db) => {
            const transaction = db.transaction(['keyStore'], 'readwrite');

            transaction.onerror = (event) => {
                console.error('IndexedDB: cannot read the key');
                reject(event);
            };

            const objectStore = transaction.objectStore('keyStore');
            const request = objectStore.get(key);

            request.onsuccess = (event) => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(event);
            };
        }).catch(reject);
    });
}


/**
 * Delete a value from IndexedDB.
 * @async
 * @function del
 * @param {string} key - The key of the value to delete.
 * @returns {Promise<void>} Resolves when the value is deleted.
 * @throws {Error} If the value cannot be deleted.
 */
export async function del(key) {
    return new Promise((resolve, reject) => {
        getDb().then((db) => {
            const transaction = db.transaction(['keyStore'], 'readwrite');
            const objectStore = transaction.objectStore('keyStore');
            const request = objectStore.delete(key);

            request.onsuccess = () => {
                resolve();
            };
            request.onerror = (event) => {
                reject(event);
            };
        }).catch(reject);
    });
}


/**
 * Retrieve all keys and their corresponding values from the database.
 * @function getAll
 * @returns {Promise<Array<{key: string, value: *}>>} A promise that resolves to an array of key-value pairs.
 * @throws {Error} If the value cannot be deleted.
 */
export async function getAll() {
    return new Promise((resolve, reject) => {
        getDb().then((db) => {
            const transaction = db.transaction(['keyStore'], 'readonly');
            const objectStore = transaction.objectStore('keyStore');
            const request = objectStore.getAllKeys();

            request.onsuccess = async (event) => {
                const keys = event.target.result;
                const values = await Promise.all(
                    keys.map((key) => get(key))
                );
                resolve(keys.map((key, index) => ({
                    key: key,
                    value: values[index]
                })));
            };

            request.onerror = (event) => reject(event);
        }).catch(reject);
    });
}