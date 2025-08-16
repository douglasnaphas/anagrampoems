const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const getExcludedWords = async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).send(responses.BAD_REQUEST);
  }
  const username = res.locals.username;
  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const getParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    ProjectionExpression: "excluded_words",
  };

  try {
    const command = new GetCommand(getParams);
    const response = await ddbDocClient.send(command);
    const excludedWords = response.Item && Array.isArray(response.Item.excluded_words)
      ? response.Item.excluded_words
      : [];
    return res.status(200).json({ excludedWords });
  } catch (err) {
    console.error("getExcludedWords error", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }
};

module.exports = getExcludedWords;
