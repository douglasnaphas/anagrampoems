const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");
// import letters and aContainsB from letters.js
const { letters, aContainsB } = require("./letters");

const putLineWords = async (req, res, next) => {
  if (!req.body.key || !req.body.lineId || !req.body.lineWords) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const { key, lineId, lineWords } = req.body;
  // Check that lineWords fit in the key
  if (
    !aContainsB(
      key,
      lineWords.reduce((wholeLine, word) => wholeLine + word, "")
    )
  ) {
    // bad request
    return res.status(400).send("Line words do not fit in the key");
  }

  const username = res.locals.username;

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const updateParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem-line#${key}#${lineId}`,
    },
    UpdateExpression: "SET line_words = :lineWords",
    ExpressionAttributeValues: {
      ":lineWords": lineWords,
    },
  };

  try {
    const command = new UpdateCommand(updateParams);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("putLineWords error updating line words", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.status(200).send();
};

module.exports = putLineWords;
