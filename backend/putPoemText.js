// backend/putPoemText.js
const AWS = require("aws-sdk"); // or v3 client if you already use it elsewhere
const ddb = new AWS.DynamoDB.DocumentClient();

const { POEMS_TABLE_NAME } = process.env; // reuse your env if you already have one

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

    // Example PK/SK — adjust to your schema
    // If your existing POEMS table uses { pk: 'POEM#<username>', sk: '<key>' } or similar:
    const Key = {
      // Example only — replace with your real keys:
      key,
      user: username,
    };

    const now = new Date().toISOString();

    await ddb
      .update({
        TableName: POEMS_TABLE_NAME,
        Key,
        UpdateExpression: "SET #text = :text, updated_at = :now",
        ExpressionAttributeNames: { "#text": "text" },
        ExpressionAttributeValues: { ":text": text, ":now": now },
        ReturnValues: "NONE",
        // Optional conditional to ensure the poem exists:
        // ConditionExpression: "attribute_exists(key)"
      })
      .promise();

    return res.status(204).end();
  } catch (err) {
    console.error("putPoemText error:", err);
    return res.status(500).json({ error: "Failed to save poem text." });
  }
};
