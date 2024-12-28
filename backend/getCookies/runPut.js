const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");

/**
 * Return middleware satisfying:
 * pre: res.locals[paramsName] is set to a valid object for params to
 * DynamoDBDocumentClient.put
 * post: DynamoDBDocumentClient.put is executed with the
 * supplied params, and res.locals.dbData and res.locals.dbError are populated
 * with the data and error from the execution
 * @param {String} paramsName The name of the res.locals property where the
 * params for this put are stored
 * @return {Function} Express middleware that executes put and calls next,
 * or sends 500 if res.locals[paramsName] is not defined
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
    }

    return next();
  };
  return middleware;
}

module.exports = runPut;
