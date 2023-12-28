const {
  PostPayloadSchema,
  PutPayloadSchema,
  DeletePayloadSchema,
} = require("./schema");
const InvariantError = require("../../../exceptions/InvariantError");

const AuthenticationsValidator = {
  validatePosAuthenticationtPayload: (payload) => {
    const validationResult = PostPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePutAuthenticationPayload: (payload) => {
    const validationResult = PutPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validateDeleteAuthenticationPayload: (payload) => {
    const validationResult = DeletePayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = AuthenticationsValidator;
