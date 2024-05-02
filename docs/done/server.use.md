### Developer Documentation for `server.use`

The `server.use` method in the `server-static` package is used to apply middleware functions and route handlers to the server. It can be used in various ways to add middleware and route handlers to specific paths or globally to the entire server.

### Signature

```typescript
server.use(...args: any[]): void
```

### Usage

#### 1. Global Middleware

Apply middleware functions globally to the entire server.

```javascript
server.use(middlewareFunction);
```

#### 2. Middleware with Specific Path

Apply middleware functions to a specific path on the server.

```javascript
server.use('/specific-path', middlewareFunction);
```

#### 3. Middleware with Route Handler

Apply middleware functions and route handlers to a specific path on the server.

```javascript
server.use('/specific-path', middlewareFunction, routeHandlerFunction);
```

#### 4. Multiple Middleware

Apply multiple middleware functions to a specific path on the server.

```javascript
server.use('/specific-path', [middlewareFunction1, middlewareFunction2], routeHandlerFunction);
```

### Parameters

- `path` (string): Optional. The path at which to apply the middleware or route handler.
- `middlewares` (Function or Function[]): One or more middleware functions to be applied.
- `callback` (Function): Optional. The route handler function to be executed when the path is matched.

### Example

```js
const router = new Router();
router.get("/", (req: Request, res: Response) => {
    res.json({ test: 345 })
})
router.get("/testing", (req: Request, res: Response) => {
    res.json({})
})
server.use('/', router)
```

```javascript
const server = new Server();

// Global middleware
server.use(middlewareFunction);

// Middleware with specific path
server.use('/specific-path', middlewareFunction);

// Middleware with route handler
server.use('/specific-path', middlewareFunction, routeHandlerFunction);

// Multiple middleware with route handler
server.use('/specific-path', [middlewareFunction1, middlewareFunction2], routeHandlerFunction);
```

Here's the developer documentation for handling "Not Found" scenarios using the `server.use` method in the `server-static` package:

---

## Developer Documentation: Handling "Not Found" with `server.use`

#### Handling "Not Found" with Middleware

To handle "Not Found" errors using middleware, you can define a middleware function that responds with a "Not Found" message and apply it as the last middleware in the middleware chain.

```javascript
server.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
```

#### Handling "Not Found" with a Route Handler

Alternatively, you can define a route handler specifically for "Not Found" scenarios and apply it globally or to a specific path.

```javascript
server.use('*', (req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
```

### Behavior

- The middleware or route handler for "Not Found" scenarios should be applied after all other routes and middleware to ensure it captures requests that do not match any existing routes.
- It's common practice to set the HTTP status code to 404 to indicate that the requested resource was not found.
- You can customize the response body to include additional details or error messages as needed.

### Examples

#### Applying "Not Found" Middleware Globally

```javascript
server.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
```

#### Applying "Not Found" Route Handler to a Specific Path

```javascript
server.use('/not-found', (req, res) => {
    res.status(404).json({ error: 'Custom Not Found Page' });
});
```
