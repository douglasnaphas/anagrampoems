import serverless from "serverless-http";
import app from "./express-app";

const handler = serverless(app);

export { handler };
