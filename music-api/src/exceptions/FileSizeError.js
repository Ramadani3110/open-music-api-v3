const ClientError = require("./ClientError");

class FileSizeError extends ClientError {
  constructor(message) {
    super(message, 413);
    this.name = "FileSizeError";
  }
}

module.exports = FileSizeError;
