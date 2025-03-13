/**
 * File: ./lib/locky.js
 * Locky object providing simplified IndexedDB operations.
 * 
 * @namespace Locky
 * @property {Function} set - Store a key-value pair in the IndexedDB.
 * @property {Function} get - Retrieve a value from the IndexedDB using a key.
 * @property {Function} del - Delete a key-value pair from the IndexedDB using a key.
 * @property {Function} getAll - Retrieve all key-value pairs from the IndexedDB.
 */

import { set, get, del, getAll } from './indexdb.js';

const Locky = {
    set,   // Function to set a key-value pair in IndexedDB
    get,   // Function to get a value by key from IndexedDB
    del,   // Function to delete a key-value pair from IndexedDB
    getAll // Function to get all key-value pairs from IndexedDB
};

export default Locky;