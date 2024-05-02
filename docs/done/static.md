## Developer Documentation for npm Package `server.static`

### Introduction

`server.static` is a method provided by the npm package to serve static files over an HTTP server. It allows developers to easily configure routes and paths for serving static content such as HTML, CSS, JavaScript, and images.

### Usage

#### Basic Usage

```javascript
// Serve a single file at the root route
server.static('/', path.join(__dirname, 'image.png'));

// Serve a single file at a specific route
server.static('/test/', path.join(__dirname, 'image.png'));

// Serve files from a folder
server.static(path.join(__dirname, 'public'));
```

### API

#### `server.static(route: string, path: string): void`

- **Parameters:**
  - `route` (string): The route at which the static content will be served.
  - `path` (string): The path to the static file or folder.

#### Overloads

##### `server.static(path: string): void`

- **Parameters:**
  - `path` (string): The path to the static folder.

### Example

```javascript

// Serve a single file at the root route
server.static('/', path.join(__dirname, 'image.png'));

// Serve a single file at a specific route
server.static('/test/', path.join(__dirname, 'image.png'));

// Serve files from a folder
server.static(path.join(__dirname, 'public'));
```

### Notes

- Make sure to provide the correct paths to the static files or folders.
- Ensure that the server has appropriate permissions to access the files or folders.
- Declare it top of code.
