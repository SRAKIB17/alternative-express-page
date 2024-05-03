#!/usr/bin/env node
// Import your server module
// const { handleRequest } = require('./server');
// Get the command-line arguments
const args = process.argv.slice(2);

// Check the first argument (the command)
const command = args[0];

// Execute the appropriate action based on the command
switch (command) {
    case 'start':
        startServer();
        break;
    default:
        console.log('Usage: cli.js <command>');
        console.log('Commands:');
        console.log('  start - Start the server');
}

// Function to start the server
function startServer() {
    // Call your server start function here
    // For example:
    // handleRequest();
    console.log(4534)
}
