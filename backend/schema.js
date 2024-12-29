/**
 * Contains various information about the database schema, such as attribute
 * names.
 *
 * See https://github.com/douglasnaphas/madliberation/wiki/Database-schema.
 */
const schema = {
  TABLE_NAME: process && process.env && process.env["TABLE_NAME"],
  SEPARATOR: "#",
  // key attribute names
  PARTITION_KEY: "PK",
  SORT_KEY: "SK",
  ITEM_TYPE: {
    LOGIN_COOKIE: "login_cookie",
    SUBJECT: "sub",
  },
  // relating to the compound sort key
  USERINFO_PREFIX: "userinfo",
  // indexes
  OPAQUE_COOKIE_INDEX: "opaque_cookie_index",
  // attribute names
  // users
  USER_EMAIL: "user_email",
  USERNAME: "username",
  // opaque cookie
  OPAQUE_COOKIE: "opaque_cookie",
  OPAQUE_COOKIE_ISSUED_MILLISECONDS: "cookie_issued_ms",
  OPAQUE_COOKIE_EXPIRATION_MILLISECONDS: "cookie_expiration_ms",
  OPAQUE_COOKIE_ISSUED_DATE: "cookie_issued_date",
  OPAQUE_COOKIE_EXPIRATION_DATE: "cookie_expiration_date",
  // WebSockets
  CONNECTION: "connection",
  EVENT: "event", // CONNECT or DISCONNECT
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  DATE: "date",
  MS: "ms",
  CONNECTION_ID: "connection_id",
};

module.exports = schema;
