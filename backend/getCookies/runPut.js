const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * @param {String} paramsName The name of the res.locals property where the
 * params for this put are stored
 */
function runPut(paramsName) {
  const middleware = async (req, res, next) => {
    const responses = require("../responses");
    if (!res.locals[paramsName]) {
      return res.status(500).send(responses.SERVER_ERROR);
    }

    const client = new DynamoDBClient();
    const ddbDocClient = DynamoDBDocumentClient.from(client);

    try {
      const command = new PutCommand(res.locals[paramsName]);
      const data = await ddbDocClient.send(command);
      res.locals.dbData = data;
      res.locals.dbError = null;
    } catch (err) {
      res.locals.dbError = err;
      res.locals.dbData = null;
      console.log("runPut error", err);
      return res.status(500).send(responses.SERVER_ERROR);
    }

    return next();
  };
  return middleware;
}

module.exports = runPut;
