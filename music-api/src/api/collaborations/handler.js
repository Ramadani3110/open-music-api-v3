/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const autobind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class CollaborationsHandler {
  constructor(collaborationsService, playlistService, validator) {
    this._service = collaborationsService;
    this._playlistService = playlistService;
    this._validator = validator;

    autobind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialsId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(
        playlistId,
        credentialsId
      );
      const collaborationId = await this._service.addCollaboration(
        playlistId,
        userId
      );

      const response = h.response({
        status: "success",
        message: "Berhadil menambahkan kolaborasi",
        data: {
          collaborationId,
        },
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

      // server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialsId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(
        playlistId,
        credentialsId
      );
      await this._service.deleteCollaboration(
        playlistId,
        userId,
        credentialsId
      );

      return {
        status: "success",
        message: "Berhasil menghapus kolaborasi",
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: "fail",
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }
}
module.exports = CollaborationsHandler;
