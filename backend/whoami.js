function whoami(req, res) {
  return res.send({
    username: `${res.locals.username}`,
    user_email: `${res.locals.user_email}`,
  });
}
module.exports = whoami;
