const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const putPoems = async (req, res, next) => {
  if (!req.body.key || !req.body.poemLineIdOrder) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const { key, poemLineIdOrder } = req.body;
  if (!Array.isArray(poemLineIdOrder)) {
    return res.status(400).send("poemLineIdOrder must be an array");
  }

  const username = res.locals.username;

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const updateParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    UpdateExpression: "SET poem_line_id_order = :poemLineIdOrder",
    ExpressionAttributeValues: {
      ":poemLineIdOrder": poemLineIdOrder,
    },
  };

  try {
    const command = new UpdateCommand(updateParams);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("putPoems error updating poem line order", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.status(200).send();
};

module.exports = putPoems;
