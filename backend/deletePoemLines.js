const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const deletePoemLines = async (req, res, next) => {
  const { key, lineId, poemLineIdOrder } = req.query;
  if (!key || !lineId || !poemLineIdOrder) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const parsedPoemLineIdOrder = JSON.parse(poemLineIdOrder);
  if (!Array.isArray(parsedPoemLineIdOrder)) {
    return res.status(400).send("poemLineIdOrder must be an array");
  }

  const username = res.locals.username;
  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  // Update the poem line id order
  const updateParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    UpdateExpression: "SET poem_line_id_order = :poemLineIdOrder",
    ExpressionAttributeValues: {
      ":poemLineIdOrder": parsedPoemLineIdOrder,
    },
  };

  try {
    const updateCommand = new UpdateCommand(updateParams);
    await ddbDocClient.send(updateCommand);
  } catch (err) {
    console.error("deletePoemLines error updating poem line order", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  // Delete the poem line
  const deleteParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem-line#${key}#${lineId}`,
    },
  };

  try {
    const deleteCommand = new DeleteCommand(deleteParams);
    await ddbDocClient.send(deleteCommand);
  } catch (err) {
    console.error("deletePoemLines error deleting poem line", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.status(204).send();
};

module.exports = deletePoemLines;
