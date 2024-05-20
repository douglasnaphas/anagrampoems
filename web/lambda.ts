import serverless from "serverless-http";
import app from "./express-app";
import type { Handler } from "aws-lambda";

const handler: Handler = serverless(app);

export { handler };
