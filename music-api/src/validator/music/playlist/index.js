const { PostPayloadSchema, PostWithSongPayloadSchema } = require("./schema");
const InvariantError = require("../../../exceptions/InvariantError");

const PlaylistValidator = {
  validatePostPlaylistPayload: (payload) => {
    const validationResult = PostPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },

  validatePostWithSongPlaylistPayload: (payload) => {
    const validationResult = PostWithSongPayloadSchema.validate(payload);
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

module.exports = PlaylistValidator;
