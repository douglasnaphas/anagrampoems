const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const deleteExcludedWord = async (req, res) => {
  const { key, word } = req.body;
  if (!key || !word) {
    return res.status(400).send(responses.BAD_REQUEST);
  }
  const username = res.locals.username;
  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  // Get current excluded_words
  const getParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    ProjectionExpression: "excluded_words",
  };
  try {
    const getCommand = new GetCommand(getParams);
    const getResponse = await ddbDocClient.send(getCommand);
    const excludedWords = getResponse.Item && Array.isArray(getResponse.Item.excluded_words)
      ? getResponse.Item.excluded_words
      : [];
    const newExcludedWords = excludedWords.filter(w => w !== word);
    const updateParams = {
      TableName: schema.TABLE_NAME,
      Key: {
        [schema.PARTITION_KEY]: `user#${username}`,
        [schema.SORT_KEY]: `poem#${key}`,
      },
      UpdateExpression: "SET excluded_words = :excludedWords",
      ExpressionAttributeValues: {
        ":excludedWords": newExcludedWords,
      },
    };
    const updateCommand = new UpdateCommand(updateParams);
    await ddbDocClient.send(updateCommand);
    return res.status(200).send();
  } catch (err) {
    console.error("deleteExcludedWord error", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }
};

module.exports = deleteExcludedWord;
