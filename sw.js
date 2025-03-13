/**
 * File: sw.js
 * Service Worker script for handling caching strategies and offline support.
 * 
 * This Service Worker script sets up caching strategies and handles fetch events to
 * provide offline support and improve performance by caching resources.
 * It uses different caching strategies based on the URL or file extension and
 * manages pre-caching of important assets during installation.
 * 
 * @module ServiceWorker
 */

/**
 * Initialize the Service Worker with the specified configuration.
 * @function initServiceWorker
 * @param {Object} config - The configuration object for the Service Worker.
 * @param {string} [config.cacheName='locky-1'] - The name of the cache to use. Default is 'locky-1'.
 * @param {string[]} [config.precacheFiles] - An array of files to pre-cache during installation.
 * @param {Object} [config.strategyMapping] - An object mapping URL paths or file extensions to caching strategies.
 * @param {boolean} [config.enableLogging=false] - Whether to enable logging for debugging purposes.
 * 
 * @example
 * self.initServiceWorker({
 *     cacheName: 'my-cache',
 *     precacheFiles: [
 *         '/index.html',
 *         '/styles.css',
 *         '/scripts/main.js',
 *         '/images/logo.png'
 *     ],
 *     strategyMapping: {
 *         'default': 'network-first',
 *         '/index.html': 'cache-first',
 *         '.js': 'cache-first',
 *         '.css': 'cache-first',
 *         '.png': 'cache-first'
 *     },
 *     enableLogging: true
 * });
 */

importScripts('./lib/swLib.js');

self.initServiceWorker({
    cacheName: 'locky-1', // Specify the name of the cache
    precacheFiles: [
        '/index.html', // The main HTML file
        '/styles.css', // The main CSS file
        '/app.js', // The main JavaScript file
        '/images/logo.png' // A logo image
    ],
    strategyMapping: {
        'default': 'network-first', // Default strategy: try network first, then cache
        '/index.html': 'cache-first', // Cache index.html first
        '.js': 'cache-first', // Cache JavaScript files first
        '.css': 'cache-first', // Cache CSS files first
        '.png': 'cache-first' // Cache PNG images first
    },
    enableLogging: true // Enable logging for debugging
});
