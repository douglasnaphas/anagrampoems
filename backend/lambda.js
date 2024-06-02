const serverless = require("serverless-http");
const app = require("./express-app");

const handler = serverless(app);

export { handler };
