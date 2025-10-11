const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

const schema = require("./schema");

// v3 client setup
const ddbClient = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(ddbClient);

module.exports = async function getPoemText(req, res) {
  try {
    const { key } = req.query;
    if (!key || typeof key !== "string") {
      return res
        .status(400)
        .json({ error: "Missing or invalid 'key' parameter." });
    }

    const username = res.locals?.username;
    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Adjust Key to match putPoemText schema: user partition + text sort
    const Key = {
      [schema.PARTITION_KEY]: `user#${username}`,
      [schema.SORT_KEY]: `text#${key}`,
    };

    const result = await ddb.send(
      new GetCommand({
        TableName: schema.TABLE_NAME,
        Key,
        ProjectionExpression: "#text",
        ExpressionAttributeNames: { "#text": "text" },
      })
    );

    if (!result.Item) {
      return res.status(404).json({ error: "Poem not found." });
    }

    // Respond with only the text field (default empty string if missing)
    const text = typeof result.Item.text === "string" ? result.Item.text : "";
    return res.json({ text });
  } catch (err) {
    console.error("getPoemText error:", err);
    return res.status(500).json({ error: "Failed to get poem text." });
  }
};
