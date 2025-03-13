/**
 * File: ./lib/swLib.js
 * A utility library for handling service worker operations and caching strategies.
 * @module ServiceWorkerLibrary
 */

(function () {
    /**
     * Initialize the Service Worker with the given configuration.
     * @function initServiceWorker
     * @param {Object} config - The configuration object for the Service Worker.
     * @param {string} [config.cacheName='default-cache'] - The name of the cache to use.
     * @param {string[]} [config.precacheFiles=[]] - An array of files to pre-cache during installation.
     * @param {Object} [config.strategyMapping={}] - An object mapping URL paths or file extensions to caching strategies.
     * @param {boolean} [config.enableLogging=false] - Whether to enable logging for debugging purposes.
     */
    const initServiceWorker = (config) => {
        const cacheName = config.cacheName || 'default-cache';
        const precacheFiles = config.precacheFiles || [];
        const strategyMapping = config.strategyMapping || {};
        const enableLogging = config.enableLogging || false;

        /**
         * Log a message to the console if logging is enabled.
         * @function log
         * @param {string} message - The message to log.
         */
        const log = (message) => {
            if (enableLogging) {
                console.log(`[Service Worker] ${message}`);
            }
        };

        /**
         * Pre-cache the files specified in the configuration.
         * @function preCache
         * @returns {Promise<void>} A promise that resolves when pre-caching is complete.
         */
        const preCache = async () => {
            try {
                const cache = await caches.open(cacheName);
                await cache.addAll(precacheFiles);
                log('Pre-caching completed successfully.');
            } catch (error) {
                log(`Pre-caching failed: ${error}`);
            }
        };

        /**
         * Serve the request using the "cache-first" strategy.
         * @function cacheFirst
         * @param {Request} request - The request to handle.
         * @returns {Promise<Response>} A promise that resolves to the response.
         */
        const cacheFirst = async (request) => {
            const cache = await caches.open(cacheName);
            try {
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    log(`Serving from cache: ${request.url}`);
                    return cachedResponse;
                }
                throw new Error('No cache match');
            } catch (error) {
                log(`Cache miss, fetching from network: ${request.url}`);
                return fetchAndCache(request);
            }
        };

        /**
         * Serve the request using the "network-first" strategy.
         * @function networkFirst
         * @param {Request} request - The request to handle.
         * @returns {Promise<Response>} A promise that resolves to the response.
         */
        const networkFirst = async (request) => {
            const cache = await caches.open(cacheName);
            try {
                const networkResponse = await fetch(request);
                if (networkResponse) {
                    log(`Network request successful: ${request.url}`);
                    cache.put(request, networkResponse.clone());
                    return networkResponse;
                }
                throw new Error('Network response was null');
            } catch (error) {
                log(`Network request failed, trying cache: ${request.url}`);
                const cachedResponse = await cache.match(request);
                if (cachedResponse) {
                    return cachedResponse;
                }
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            }
        };

        /**
         * Fetch the request from the network and cache it.
         * @function fetchAndCache
         * @param {Request} request - The request to handle.
         * @returns {Promise<Response>} A promise that resolves to the response.
         */
        const fetchAndCache = async (request) => {
            const cache = await caches.open(cacheName);
            try {
                const networkResponse = await fetch(request);
                if (networkResponse) {
                    cache.put(request, networkResponse.clone());
                    log(`Fetched and cached: ${request.url}`);
                    return networkResponse;
                }
                throw new Error('Network response was null');
            } catch (error) {
                log(`Fetch failed: ${error}`);
                return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
            }
        };

        /**
         * Determine the caching strategy for the given request.
         * @function determineStrategy
         * @param {Request} request - The request to handle.
         * @returns {string} The caching strategy to use.
         */
        const determineStrategy = (request) => {
            const url = new URL(request.url);
            const pathname = url.pathname;
            const extension = pathname.substring(pathname.lastIndexOf('.'));
            if (strategyMapping[pathname]) {
                return strategyMapping[pathname];
            }
            if (strategyMapping[extension]) {
                return strategyMapping[extension];
            }
            return strategyMapping['default'] || 'network-first';
        };

        // Event listeners for the Service Worker lifecycle

        /**
         * Install event handler for the Service Worker.
         * Pre-caches files and takes control immediately.
         * @event install
         */
        self.addEventListener('install', (event) => {
            log('Install event triggered.');
            event.waitUntil(preCache());
            self.skipWaiting(); // Take control immediately
        });

        /**
         * Activate event handler for the Service Worker.
         * Takes control of the pages without reloading them.
         * @event activate
         */
        self.addEventListener('activate', (event) => {
            log('Activate event triggered.');
            event.waitUntil(self.clients.claim()); // Take control of pages without reloading
        });

        /**
         * Fetch event handler for the Service Worker.
         * Uses the appropriate strategy based on the configuration.
         * @event fetch
         */
        self.addEventListener('fetch', (event) => {
            const strategy = determineStrategy(event.request);
            log(`Fetch event for ${event.request.url} using strategy: ${strategy}`);
            if (strategy === 'cache-first') {
                event.respondWith(cacheFirst(event.request));
            } else if (strategy === 'network-first') {
                event.respondWith(networkFirst(event.request));
            } else {
                event.respondWith(fetch(event.request));
            }
        });
    };

    self.initServiceWorker = initServiceWorker;
})();
