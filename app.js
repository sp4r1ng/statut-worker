/**
 * File: app.js
 * A simple script for managing offline capabilities, storing data in IndexedDB,
 * and toggling between light and dark themes in a web application.
 * Handles Service Worker registration, data management through Locky, and 
 * theme switching based on user preferences.
 * @module app
 */

import Locky from './lib/locky.js';

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope); // registration Service Worker
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

const form = document.getElementById('dataForm');
const itemsList = document.getElementById('itemsList');

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const key = document.getElementById('key').value;
    const value = document.getElementById('value').value;

    try {
        await Locky.set(key, value);
        displayItems();
    } catch (error) {
        console.error('Failed to store data:', error);
    }

    form.reset();
});

async function displayItems() {
    itemsList.innerHTML = '';
    try {
        const items = await Locky.getAll();
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.className = 'item';

            const itemText = document.createElement('span');
            itemText.textContent = `${item.key}: ${item.value}`;

            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button';
            deleteButton.addEventListener('click', async () => {
                try {
                    await Locky.del(item.key);
                    displayItems(); // refresh
                } catch (error) {
                    console.error('Failed to delete item:', error);
                }
            });

            listItem.appendChild(itemText);
            listItem.appendChild(deleteButton);
            itemsList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Failed to retrieve items:', error);
    }
}

displayItems();

// dark & light mode
const themeToggle = document.getElementById('themeToggle');
const currentTheme = localStorage.getItem('theme') || 'light';

if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
} else {
    document.body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    themeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
});
