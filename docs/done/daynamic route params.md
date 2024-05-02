## Developer Documentation for Dynamic Route Parameters with npm Package `server.static`

### Introduction

Dynamic route parameters allow developers to define routes with placeholders that can match various values. This documentation provides examples of using dynamic route parameters with the npm package `server.static`.

### Dynamic Route Parameters Usage

#### Example: Handling Dynamic Route Parameters

```javascript

// Define a route with a dynamic parameter
server.get('/:params', (req, res) => {
    const params = req.params; // Access dynamic parameters
    res.json({ params });
});
```

### API

#### `server.get(path: string, callback: Function): void`

- **Parameters:**
  - `path` (string): The route path with dynamic parameters specified using `:` prefix.
  - `callback` (Function): The route callback function to be executed when the route is matched.

### Example

```javascript

// Define a route with a dynamic parameter
server.get('/:params', (req, res) => {
    const params = req.params; // Access dynamic parameters
    res.json({ params });
});
```
