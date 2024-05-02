
### Handling Not Found Routes

To handle requests for routes that are not found, you can use the `server.all` method:

```javascript
server.all("*", (req, res) => {
    res.json({ success: false });
});
```

### Handling Specific HTTP Methods for Not Found Routes

To handle specific HTTP methods for routes that are not found, you can use the respective methods (`get`, `post`, `put`, etc.):

```javascript
server.get("*", (req, res) => {
    res.json({});
});

server.post("*", (req, res) => {
    res.json({});
});

server.put("*", (req, res) => {
    res.json({});
});
```

### use `server.user()`

same as `server.all()`

```js
server.use("*", (req, res) => {
    return res.html("Not Found")
})
```

with middleware:

```js
server.use(middleware, (req, res) => {
    return res.html("Not Found")
})
```

### Notes

- Make sure to provide the correct paths to the static files or folders.
- Ensure that the server has appropriate permissions to access the files or folders.
<!-- - use this method bottom of `app.js` file. Count first one -->
