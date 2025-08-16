const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const putExcludedWords = async (req, res, next) => {
  if (!req.body.key || !Array.isArray(req.body.excludedWords)) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const { key, excludedWords } = req.body;
  const username = res.locals.username;

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const updateParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    UpdateExpression: "SET excluded_words = :excludedWords",
    ExpressionAttributeValues: {
      ":excludedWords": excludedWords,
    },
  };

  try {
    const command = new UpdateCommand(updateParams);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("putExcludedWords error updating excluded words", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.status(200).send();
};

module.exports = putExcludedWords;
