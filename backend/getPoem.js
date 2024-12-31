const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");
const responses = require("./responses");

const getPoem = async (req, res, next) => {
  const username = res.locals.username;
  if (!username) {
    return res.status(400).send({ error: "Missing username" });
  }
  const { key } = req.query;
  if (!key) {
    return res.status(400).send({ error: "Missing key parameter" });
  }

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
  };

  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    if (!data.Item) {
      return res.status(404).send({ error: "Poem not found" });
    }
    return res.send(data.Item);
  } catch (err) {
    console.error("getPoem", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }
};

module.exports = getPoem;
