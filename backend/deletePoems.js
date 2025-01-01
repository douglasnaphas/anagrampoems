const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
  QueryCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const deletePoems = async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).send(responses.BAD_REQUEST);
  }

  const username = res.locals.username;
  const client = new DynamoDBClient();
  const ddbDocClient = DynamoDBDocumentClient.from(client);

  // Get the item with PK user#${username} and SK poem#${key}
  const getParams = {
    TableName: schema.TABLE_NAME,
    Key: {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `poem#${key}`,
    },
  };

  // Query for all items with PK user#${username} and SK beginning with poem-line#${key}#
  const queryParams = {
    TableName: schema.TABLE_NAME,
    KeyConditionExpression: `${schema.PARTITION_KEY} = :pk AND begins_with(${schema.SORT_KEY}, :skPrefix)`,
    ExpressionAttributeValues: {
      ":pk": `user#${username}`,
      ":skPrefix": `poem-line#${key}#`,
    },
  };

  try {
    const getCommand = new GetCommand(getParams);
    const getResponse = await ddbDocClient.send(getCommand);

    const queryCommand = new QueryCommand(queryParams);
    const queryResponse = await ddbDocClient.send(queryCommand);

    const itemsToDelete = [];
    if (getResponse.Item) {
      itemsToDelete.push(getResponse.Item);
    }
    if (queryResponse.Items.length > 0) {
      itemsToDelete.push(...queryResponse.Items);
    }

    if (itemsToDelete.length === 0) {
      return res.status(404).send(responses.NOT_FOUND);
    }

    // Delete each item found
    for (const item of itemsToDelete) {
      const deleteParams = {
        TableName: schema.TABLE_NAME,
        Key: {
          [schema.PARTITION_KEY]: item[schema.PARTITION_KEY],
          [schema.SORT_KEY]: item[schema.SORT_KEY],
        },
      };
      const deleteCommand = new DeleteCommand(deleteParams);
      await ddbDocClient.send(deleteCommand);
    }

    return res.status(204).send();
  } catch (err) {
    console.error("deletePoems error", err);
    return res.status(500).send(responses.SERVER_ERROR);
  }
};

module.exports = deletePoems;
