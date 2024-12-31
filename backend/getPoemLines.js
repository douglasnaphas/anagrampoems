const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");

const client = new DynamoDBClient();
const docClient = DynamoDBDocumentClient.from(client);

const getPoemLines = async (req, res) => {
  const { key } = req.query;
  if (!key) {
    return res.status(400).send({ error: "Missing key parameter" });
  }

  const params = {
    TableName: schema.TABLE_NAME,
    KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
    ExpressionAttributeValues: {
      ":pk": `user#${res.locals.username}`,
      ":sk": `poem-line#${key}`,
    },
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    const lines = data.Items.reduce((acc, item) => {
      const line_id = item.SK.split("#").slice(-1)[0];
      acc[line_id] = item.line_words;
      return acc;
    }, {});
    return res.status(200).send(lines);
  } catch (error) {
    console.error("Error retrieving poem lines:", error);
    return res.status(500).send({ error: "Could not retrieve poem lines" });
  }
};

module.exports = getPoemLines;
