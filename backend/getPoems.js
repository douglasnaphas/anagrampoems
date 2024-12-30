const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");
const responses = require("./responses");

const getPoems = async (req, res, next) => {
  const username = res.locals.username;
  if (!username) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const params = {
    TableName: schema.TABLE_NAME,
    KeyConditionExpression: `${schema.PARTITION_KEY} = :pk AND begins_with(${schema.SORT_KEY}, :sk)`,
    ExpressionAttributeValues: {
      ":pk": `user#${username}`,
      ":sk": "poem#",
    },
  };

  try {
    const data = await ddbDocClient.send(new QueryCommand(params));
    const poemKeys = data.Items.map(
      (item) => item[schema.SORT_KEY].split("poem#")[1]
    );
    return res.send(poemKeys);
  } catch (err) {
    console.error("getPoems", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }
};

module.exports = getPoems;
