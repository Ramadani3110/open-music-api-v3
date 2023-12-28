/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const ClientError = require("../../exceptions/ClientError");

class ExportsHandler {
  constructor(exportsService, playlistService, validator) {
    this._exportsService = exportsService;
    this._playlistService = playlistService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);
      const { playlistId } = request.params;
      const { id: userId } = request.auth.credentials;
      const message = {
        userId,
        targetEmail: request.payload.targetEmail,
        playlist_id: playlistId,
      };

      await this._playlistService.verifyPlaylistOwner(playlistId, userId);
      await this._exportsService.sendMessage(
        "exports:playlist",
        JSON.stringify(message)
      );

      const response = h.response({
        status: "success",
        message: "Permintaan Anda sedang kami proses",
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }
}
module.exports = ExportsHandler;
