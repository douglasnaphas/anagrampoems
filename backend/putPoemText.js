// backend/putPoemText.js
const AWS = require("aws-sdk"); // or v3 client if you already use it elsewhere
const ddb = new AWS.DynamoDB.DocumentClient();
const schema = require("./schema");

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

    await ddb
      .update({
        TableName: schema.TABLE_NAME,
        Key,
        UpdateExpression: "SET #text = :text, updated_at = :now",
        ExpressionAttributeNames: { "#text": "text" },
        ExpressionAttributeValues: { ":text": text, ":now": now },
        ReturnValues: "NONE",
      })
      .promise();

    return res.status(204).end();
  } catch (err) {
    console.error("putPoemText error:", err);
    return res.status(500).json({ error: "Failed to save poem text." });
  }
};
