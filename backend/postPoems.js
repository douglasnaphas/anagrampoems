const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const responses = require("./responses");
const schema = require("./schema");

const postPoems = async (req, res, next) => {
    if (!req.body.key) {
        return res.status(400).send(responses.BAD_REQUEST);
    }

    const key = decodeURIComponent(req.body.key);
    const username = res.locals.username;

    const client = new DynamoDBClient();
    const ddbDocClient = DynamoDBDocumentClient.from(client);

    const params = {
        TableName: schema.TABLE_NAME,
        Item: {
            [schema.PARTITION_KEY]: `user#${username}`,
            [schema.SORT_KEY]: `poem#${key}`,
        },
    };

    try {
        const command = new PutCommand(params);
        await ddbDocClient.send(command);
        return res.redirect(`/?poem=${encodeURIComponent(key)}`);
    } catch (err) {
        console.error("postPoems error", err);
        return res.status(500).send(responses.SERVER_ERROR);
    }
};

module.exports = postPoems;