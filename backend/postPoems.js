const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const postPoems = async (req, res, next) => {
  if (!req.body.key) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const key = decodeURIComponent(req.body.key);
  const username = res.locals.username;

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: schema.TABLE_NAME,
    Item: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
      poem_line_id_order: [1],
    },
  };

  try {
    const command = new PutCommand(params);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("postPoems error creating poem", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  // Create an item in the DynamoDB table with PK user#<username> and SK
  // poem-line#<key>. The item should have an attribute "line_text" with the
  // value of the key parameter.
  const lineId = 1;
  const keyLinePutParams = {
    TableName: schema.TABLE_NAME,
    Item: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem-line#${key}#${lineId}`,
      line_text: key,
    },
  };

  try {
    const command = new PutCommand(keyLinePutParams);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("postPoems error creating key line", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.redirect(`/?poem=${encodeURIComponent(key)}`);
};

module.exports = postPoems;
