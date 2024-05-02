import cors from 'cors';
import { Request, Response, Router, Server } from "./src";

const server = new Server();
server.listen(3000, () => {
    console.log('server running')
});


// Example routes
function middleware(req: Request, res: Response, next: (any?: any) => void) {
    return next()
}


function corsMiddleware(req: Request, res: Response, next: () => void) {
    const allowedOrigins = ['https://example1.com', 'https://example2.com']; // Replace with your two specific website URLs
    const requestOrigin = req.headers.origin;
    // Check if the request origin is allowed
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', requestOrigin); // Allow requests from the specific origin
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Allow specified HTTP methods
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
    }
    next();
}

// function corsMiddleware(req: Request, res: Response, next: () => void) {
//     res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS'); // Allow specified HTTP methods
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Allow specified headers
//     next();
// }

const corsOptionsDelegate: any = function (req: any, callback: any) {
    let corsOptions;
    if (['https://chat.openai.com/c/d24afa5c-2bbf-4873-a42e-a01320a95100'].indexOf(req.headers.origin) !== -1) {
        corsOptions = { origin: true }
    }
    else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}

server.config([corsMiddleware]);
server.config(corsMiddleware);
server.config([corsMiddleware, cors(corsOptionsDelegate)]);
server.use(cors(corsOptionsDelegate))

// server.static('/', path.join(__dirname, 'image.png'));
// server.static('/test/', path.join(__dirname));
// // Serve files from a folder
// server.static(path.join(__dirname, 'public'));

const router = new Router();
// router.get("/", (req: Request, res: Response) => {
//     res.json({ test: 345 })
// })
// router.get("/testing", (req: Request, res: Response) => {
//     res.json({})
//     server.use("*", (req, res) => {
//         return res.html("Not Found")
//     })
// })

// server.use('/', router)

const middleware1 = (req: Request, res: Response, next: (err?: any) => any) => {
    next(); // Call next to pass control to the next middleware or the route callback
    // res.json({ fsd: 345 })
};

server.use('/test', middleware1);
server.use('/test', (req, res) => {
    try {
    } catch (error) {
        console.log(error)
    }
    return res.json({})
});

// server.router('/test/', middleware1, router);


// server.route("/rakib",)

// server.all('/all', (req, res) => {
//     res.status(400).text('fsdf', { status: 500 })
// });



// server.use(cors(corsOptionsDelegate))
// // server.use(corsMiddleware)

// // // NOT FOUND
// // server.get("*", (req, res: Response) => {
// //     res.json({})
// // })
// // // NOT FOUND
// // server.post("*", (req, res: Response) => {
// //     res.json({})
// // })
// // // // NOT FOUND
// // server.put("*", (req, res: Response) => {
// //     res.json({})
// // })

// // server.all("*", (req, res) => {
// //     res.json({ success: false })
// // })


// // // Define your middleware functions
// const middleware1 = (req: Request, res: Response, next: () => void) => {
//     next(); // Call next to pass control to the next middleware or the route callback
// };

// const middleware2 = (req: Request, res: Response, next: () => void) => {
//     console.log("Middleware 2");
//     next(); // Call next to pass control to the next middleware or the route callback
// };

// // Define your route callback
// const routeCallback = (req: Request, res: Response) => {
//     console.log("Route callback");
//     res.text("GET Request Received!");
//     // res.redirect('https://www.npmjs.com/package/multer?activeTab=code')
// };

// // Add the route with middlewares
// server.get('/example', [middleware1, middleware2], routeCallback);
// server.get('/example', middleware1, routeCallback);
// // server.get('/:example', [middleware1, middleware2], routeCallback);

// server.get('/:params', (req, res) => {
//     // deleteCookie(cookieName: string, options ?: CookieOptions | undefined): void
//     res.deleteCookie('name',)
//     res.json({})
// });

// server.get('/:params', (req, res) => {
//     // (property) Request.cookies: ParsedCookie
//     const cookies = req?.cookies;
//     res.json({})
// });
// server.get('/:params', (req, res) => {
//     // (property) Request.cookies: ParsedCookie
//     // setCookie(cookieName: string, cookieValue: string, options ?: CookieOptions | undefined): void
//     res.setCookie('name', 'fsdf')
//     res.json({})
// });

// // server.get('/file', (req, res) => {
// //     const filePath = path.join(__dirname, 'server.ts');
// //     res.sendFile(filePath);
// // });

// // server.get('/:text', (req: Request, res) => {
// //     console.log(req.location)
// //     res.json(req.params);
// // });

// // server.get('/:text/:xx', (req: Request, res: Response) => {
// //     console.log(req.query)
// //     console.log(req?.params)
// //     res.html('This is a text response.');
// // });

// // server.get('/html', (req: Request, res: Response) => {
// //     res.html('<h1>This is an HTML response</h1>');
// // });



