const qs = require("qs");

const login = [
  (req, res) => {
    if (!process.env.IDP_URL) {
      return res.status(500).send("IDP_URL not set");
    }
    return res.redirect(
      301,
      process.env.IDP_URL +
        (req.query["return-page"]
          ? `&return-page=${req.query["return-page"]}`
          : "")
    );
  },
];
module.exports = login;
