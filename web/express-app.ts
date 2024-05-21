import express, { Request, Response } from "express";
// import { render } from './dist/server/entry-server.js';
import { render } from "./src/entry-server";

const app = express();

app.get("/hello", (req: Request, res: Response) => {
  res.send("Hello from Express on AWS Lambda!");
});

app.use(express.static("dist/client"));

app.get("*", (req, res) => {
  const appHtml = render();
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Vite + React SSR</title>
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script type="module" src="/assets/client.js"></script>
      </body>
    </html>
  `);
});

export default app;
