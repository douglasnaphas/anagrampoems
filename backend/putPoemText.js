const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");

// v3 client setup
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports = async function putPoemText(req, res) {
  try {
    const { key, text } = req.body || {};
    if (!key || typeof key !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'key'." });
    }
    if (typeof text !== "string") {
      return res.status(400).json({ error: "Missing or invalid 'text'." });
    }

    // If poems are user-scoped, include user in the key here
    const username = res.locals?.username;

    const Key = {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `text#${key}`,
    };

    const now = new Date().toISOString();

    await ddb.send(
      new UpdateCommand({
        TableName: schema.TABLE_NAME,
        Key,
        UpdateExpression: "SET #text = :text, updated_at = :now",
        ExpressionAttributeNames: { "#text": "text" },
        ExpressionAttributeValues: { ":text": text, ":now": now },
        ReturnValues: "NONE",
      })
    );

    return res.status(204).end();
  } catch (err) {
    console.error("putPoemText error:", err);
    return res.status(500).json({ error: "Failed to save poem text." });
  }
};
