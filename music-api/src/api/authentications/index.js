/* eslint-disable comma-dangle */
const AuthenticationsHandler = require("./handler");
const routes = require("./routes");

module.exports = {
  name: "authentications",
  version: "1.0.0",
  register: async (
    server,
    // eslint-disable-next-line object-curly-newline
    { authenticationsService, usersService, tokenManager, validator }
  ) => {
    const authenticationsHandler = new AuthenticationsHandler({
      authenticationsService,
      usersService,
      tokenManager,
      validator,
    });
    server.route(routes(authenticationsHandler));
  },
};
