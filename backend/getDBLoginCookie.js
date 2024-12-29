const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");

function getDBLoginCookie() {
  const middleware = async (req, res, next) => {
    const responses = require("./responses");
    const loginCookie = req.cookies["login"];
    const client = new DynamoDBClient();
    const ddbDocClient = DynamoDBDocumentClient.from(client);

    const params = {
      TableName: schema.TABLE_NAME,
      Key: {
        [schema.PARTITION_KEY]: `login_cookie#${loginCookie}`,
        [schema.SORT_KEY]: "opaque_cookie",
      },
    };

    try {
      const command = new GetCommand(params);
      const data = await ddbDocClient.send(command);

      if (!data.Item) {
        return res.status(401).send("Unauthorized: Cookie not found");
      }

      if (data.Item.logged_out) {
        return res.status(401).send("Unauthorized: Cookie has been logged out");
      }

      res.locals.username = data.Item.username;
      res.locals.user_email = data.Item.user_email;
      return next();
    } catch (err) {
      console.log("getDBLoginCookies error", err);
      return res.status(500).send(responses.SERVER_ERROR);
    }
  };

  return middleware;
}

module.exports = getDBLoginCookie;
