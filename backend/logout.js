const AWS = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  UpdateCommand,
} = require("@aws-sdk/lib-dynamodb");
const schema = require("./schema");

const client = new AWS.DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const logout = async (req, res, next) => {
  const loginCookie = res.locals.loginCookie;

  if (!loginCookie) {
    return res.status(400).send("Login cookie is missing");
  }

  const params = {
    TableName: schema.TABLE_NAME,
    Key: {
      PK: `login_cookie#${loginCookie}`,
      SK: "opaque_cookie",
    },
    UpdateExpression: "SET logged_out = :true",
    ExpressionAttributeValues: {
      ":true": true,
    },
  };

  try {
    await ddbDocClient.send(new UpdateCommand(params));
  } catch (error) {
    console.error("Error updating DynamoDB item:", error);
    return res.status(500).send("Internal Server Error");
  }

  // Clear the login cookie
  res.clearCookie("login", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });

  // Redirect to /
  return res.redirect("/");
};

module.exports = logout;
