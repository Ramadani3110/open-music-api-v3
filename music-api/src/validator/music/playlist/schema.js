const Joi = require("joi");

const PostPayloadSchema = Joi.object({
  name: Joi.string().required(),
});

const PostWithSongPayloadSchema = Joi.object({
  songId: Joi.string().required(),
});

module.exports = {
  PostPayloadSchema,
  PostWithSongPayloadSchema,
};
