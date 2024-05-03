import { CreateServer } from "page-router";

// Start the server
const server = new CreateServer();
const port = 3000;
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
