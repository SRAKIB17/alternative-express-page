## Developer Documentation for Common Middleware(Config) with npm Package `server.static`

### Introduction

Middleware functions are essential in Node.js applications for processing HTTP requests. They can perform tasks such as logging, authentication, error handling, and more. This documentation provides examples of common middleware usage with the npm package `server.static`.

### Common Middleware Usage

#### `server.config`

The `server.config` method is used to configure middleware for the server. You can use it to apply common middleware like CORS.

##### Example 1: Using `server.config` with a single middleware

```javascript
const corsMiddleware = require('cors');

// Apply CORS middleware using server.config
server.config(corsMiddleware);
```

##### Example 2: Using `server.config` with multiple middlewares

```javascript
const corsMiddleware = require('cors');
const helmetMiddleware = require('helmet');

// Apply multiple middlewares using server.config
server.config([corsMiddleware, helmetMiddleware]);
```

#### `server.use`

The `server.use` method is similar to `server.config` and is used to apply middleware to the server.

##### Example

```javascript
const cors = require('cors');

// Apply CORS middleware using server.use
server.use(cors());
```

### API

#### `server.config(middlewares: ((req: Request, res: Response, next: () => void) => void)[]): void`

- **Parameters:**
  - `middlewares` (Array): An array of middleware functions to be applied to the server.

#### `server.use(middleware: (req: Request, res: Response, next: () => void) => void): void`

- **Parameters:**
  - `middleware` (Function): The middleware function to be applied to the server.

### Example

```javascript
const cors = require('cors');
const helmet = require('helmet');

// Using server.config with multiple middlewares
server.config([cors(), helmet()]);



// Alternatively, using server.use
server.use(cors());
// array
server.use([middleware, middleware1])
```
