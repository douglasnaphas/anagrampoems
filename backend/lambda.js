const serverless = require("serverless-http");
const app = require("./express-app");

const handler = serverless(app);

module.exports = { handler };
