To create a server using the `server-static` package and configure it to listen on a specific port, you can follow these steps:

1. Import the necessary modules:

   ```javascript
   const { Server } = require('server-static');
   ```

2. Create an instance of the server:

   ```javascript
   const server = new Server();
   ```

3. Define routes and middleware as needed.

4. Configure the server to listen on a specific port:

   ```javascript
   const PORT = 3000;
   server.listen(PORT, () => {
       console.log(`Server running on port ${PORT}`);
   });
   ```

Here's the complete example:

```javascript
const { Server } = require('server-static');

// Create a server instance
const server = new Server();

// Define routes and middleware

// Example route
server.get('/', (req, res) => {
    res.send('Hello, world!');
});

// Configure the server to listen on a specific port
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

This example creates a basic server instance listening on port 3000. You can replace the route and middleware definitions with your own logic as needed.
