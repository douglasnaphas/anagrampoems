const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, UpdateCommand, PutCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const postPoemLines = async (req, res, next) => {
  if (!req.body.key || !req.body.lineId) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const { key, lineId } = req.body;
  const username = res.locals.username;

  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  const updateParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
    UpdateExpression: "SET poem_line_id_order = list_append(poem_line_id_order, :lineId)",
    ExpressionAttributeValues: {
      ":lineId": [lineId],
    },
  };

  try {
    const command = new UpdateCommand(updateParams);
    await ddbDocClient.send(command);
  } catch (err) {
    console.error("postPoemLines error updating poem", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  const newLinePutParams = {
    TableName: schema.TABLE_NAME,
    Item: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem-line#${key}#${lineId}`,
      line_words: [],
    },
    ConditionExpression: "attribute_not_exists(#pk) AND attribute_not_exists(#sk)",
    ExpressionAttributeNames: {
      "#pk": schema.PARTITION_KEY,
      "#sk": schema.SORT_KEY,
    },
  };

  try {
    const command = new PutCommand(newLinePutParams);
    await ddbDocClient.send(command);
  } catch (err) {
    if (err.name === "ConditionalCheckFailedException") {
      console.error("postPoemLines error: item already exists", err);
      return res.status(409).send(responses.CONFLICT);
    }
    console.error("postPoemLines error creating new line", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }

  return res.status(201).send();
};

module.exports = postPoemLines;
