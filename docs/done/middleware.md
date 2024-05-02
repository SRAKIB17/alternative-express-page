## Developer Documentation for Middleware with npm Package `server.static`

### Introduction

Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application's request-response cycle. They can modify the request and response objects, terminate the request-response cycle, or call the next middleware function in the stack.

### Usage

#### Defining Middleware

Middleware functions are defined as regular JavaScript functions. Here's an example:

```javascript
const middleware1 = (req, res, next) => {
    console.log(345);
    next(); // Call next to pass control to the next middleware or the route callback
};

const middleware2 = (req, res, next) => {
    console.log("Middleware 2");
    next(); // Call next to pass control to the next middleware or the route callback
};
```

#### Defining Route Callback

Route callback functions are used to handle requests for specific routes. They receive the request and response objects. Here's an example:

```javascript
const routeCallback = (req, res) => {
    console.log("Route callback");
    console.log(req.location);
    res.text("GET Request Received!");
};
```

#### Adding Middleware to Routes

You can add middleware functions to routes using the `server.get`, `server.post`, `server.put`, etc. methods. Middleware functions can be added individually or as an array. Here's an example:

```javascript
// Add middleware functions as an array
server.get('/example', [middleware1, middleware2], routeCallback);

// Add middleware function individually
server.get('/example', middleware1, routeCallback);
```

### API

#### `server.get(path: string, middleware: Function | Function[], callback: Function): void`

- **Parameters:**
  - `path` (string): The route path.
  - `middleware` (Function | Function[]): Middleware function(s) to be executed before the route callback.
  - `callback` (Function): The route callback function to be executed when the route is matched.

### Example

```javascript
const server = require('server-static');

// Define middleware functions
const middleware1 = (req, res, next) => {
    console.log(345);
    next(); // Call next to pass control to the next middleware or the route callback
};

const middleware2 = (req, res, next) => {
    console.log("Middleware 2");
    next(); // Call next to pass control to the next middleware or the route callback
};

// Define route callback
const routeCallback = (req, res) => {
    console.log("Route callback");
    console.log(req.location);
    res.text("GET Request Received!");
};

// Add the route with middlewares
server.get('/example', [middleware1, middleware2], routeCallback);

// Alternatively, add middleware individually
server.get('/example', middleware1, routeCallback);
```

### Notes

- Middleware functions must call `next()` to pass control to the next middleware or the route callback.
- Route callback functions are executed when the route is matched.
- Middleware functions can be added individually or as an array to a route.
