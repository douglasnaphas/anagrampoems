class Configs {
  static loginCookieName() {
    return "login";
  }

  static loginCookieExpirationDate(issuedDate) {
    const DAYS = 10;
    const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
    return new Date(issuedDate.getTime() + DAYS * MILLISECONDS_PER_DAY);
  }

  static idpUrl() {
    return process.env.IDP_URL;
  }

  static jwksUrl() {
    return process.env.JWKS_URL;
  }

  static CognitoClientID() {
    return process.env.USER_POOL_CLIENT_ID;
  }

  static CognitoUserPoolID() {
    return process.env.USER_POOL_ID;
  }

  static CognitoTokenEndpointURL() {
    return (
      `https://${process.env.USER_POOL_DOMAIN}.auth.${process.env.REGION}` +
      `.amazoncognito.com/oauth2/token`
    );
  }

  static CognitoRedirectURI(protocol, host) {
    return process.env.REDIRECT_URI;
  }

  static ITEMS_PER_TX() {
    return 25;
  }
}

module.exports = Configs;
