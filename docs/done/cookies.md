#### Example: Reading Cookies

Cookies are small pieces of data that are sent from a website and stored on a user's computer by the user's web browser while the user is browsing. They are commonly used for session management, user authentication, and tracking user activity. This documentation provides examples of handling cookies with the npm package `server.static`.

### Cookies Usage

#### Example: Setting a Cookie

```javascript

// Set a cookie
server.get('/set-cookie', (req, res) => {
    res.cookie('username', 'john_doe', { maxAge: 900000, httpOnly: true });
    res.send('Cookie has been set');
});
```

#### Example: Reading a Cookie

```javascript
// Read a cookie
server.get('/read-cookie', (req, res) => {
    const username = req.cookies.username;
    res.send(`Username: ${username}`);
});
```

#### Example: Deleting a Cookie

```javascript

server.get('/:params', (req, res) => {
    res.deleteCookie('name');
    res.json({});
});
```

### API

#### `res.cookie(name: string, value: any, options?: CookieOptions): void`

- **Parameters:**
  - `name` (string): The name of the cookie.
  - `value` (any): The value of the cookie.
  - `options` (CookieOptions): Additional options for the cookie (e.g., `maxAge`, `httpOnly`, `secure`).

#### `req.cookies`

- **Description:** An object containing the cookies sent by the client.

#### `res.clearCookie(name: string, options?: CookieOptions): void`

- **Parameters:**
  - `name` (string): The name of the cookie to be deleted.
  - `options` (CookieOptions): Additional options for the cookie (e.g., `path`, `domain`, `secure`).

### Example

```javascript

// Set a cookie
server.get('/set-cookie', (req, res) => {
    res.cookie('username', 'john_doe', { maxAge: 900000, httpOnly: true });
    res.send('Cookie has been set');
});

// Read a cookie
server.get('/read-cookie', (req, res) => {
    const username = req.cookies.username;
    res.send(`Username: ${username}`);
});

// Delete a cookie
server.get('/delete-cookie', (req, res) => {
    res.deleteCookie('username');
    res.send('Cookie has been deleted');
});
```

### API

#### `res.deleteCookie(cookieName: string, options?: CookieOptions): void`

- **Parameters:**
  - `cookieName` (string): The name of the cookie to be deleted.
  - `options` (CookieOptions): Additional options for the cookie (e.g., `path`, `domain`, `secure`, `httpOnly`, `sameSite`).

#### `req.cookies`

- **Description:** An object containing the cookies sent by the client.

#### `res.setCookie(cookieName: string, cookieValue: string, options?: CookieOptions): void`

- **Parameters:**
  - `cookieName` (string): The name of the cookie.
  - `cookieValue` (string): The value of the cookie.
  - `options` (CookieOptions): Additional options for the cookie (e.g., `expires`, `path`, `domain`, `secure`, `httpOnly`, `sameSite`).
