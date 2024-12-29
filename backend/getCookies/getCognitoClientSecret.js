const Configs = require("../Configs");
const Logger = require("../Logger");
const {
  CognitoIdentityProviderClient,
  DescribeUserPoolClientCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

/**
 * @return middleware satisfying:
 *   post: res.locals.clientSecret is the client secret for the application's
 *         Cognito user pool client.
 *   500 on error.
 */
function getCognitoClientSecret(local) {
  const middleware = async (req, res, next) => {
    if (local && !res.locals[local]) return next();
    const responses = require("../responses");
    const params = {
      ClientId: Configs.CognitoClientID(),
      UserPoolId: Configs.CognitoUserPoolID(),
    };
    const client = new CognitoIdentityProviderClient();

    try {
      console.log("Getting client secret...");
      const command = new DescribeUserPoolClientCommand(params);
      const response = await client.send(command);
      res.locals.clientSecret = response.UserPoolClient.ClientSecret;
      console.log("Got client secret.");
      return next();
    } catch (error) {
      console.log(error);
      return res.status(500).send(responses.SERVER_ERROR);
    }
  };

  return middleware;
}

module.exports = getCognitoClientSecret;
