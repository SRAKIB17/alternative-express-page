To handle routing using the `server-static` package along with a router instance, you can follow these steps:

1. Import the necessary modules:

   ```javascript
   const { Server, Router } = require('server-static');
   ```

2. Create an instance of the server:

   ```javascript
   const server = new Server();
   ```

3. Create a router instance and define routes on it:

   ```javascript
   const router = new Router();

   // Define routes on the router
   router.get("/", (req, res) => {
       res.json({ test: 345 });
   });

   router.get("/testing", (req, res) => {
       res.json({});
   });
   ```

4. Define any middleware functions if needed:

   ```javascript
   const middleware1 = (req, res, next) => {
       next(); // Call next to pass control to the next middleware or the route callback
   };
   ```

5. Use the router to handle routes on the server:

```javascript
   server.router('/test/', middleware1, router);
```

   **or:** `use server.use()`

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

Here's the complete example:

```javascript
const { Server, Router } = require('server-static');

// Create a server instance
const server = new Server();

// Create a router instance
const router = new Router();

// Define routes on the router
router.get("/", (req, res) => {
    res.json({ test: 345 });
});

router.get("/testing", (req, res) => {
    res.json({});
});

// Define middleware function
const middleware1 = (req, res, next) => {
    next(); // Call next to pass control to the next middleware or the route callback
};

// Use the router to handle routes on the server
server.router('/test/', middleware1, router);
```
