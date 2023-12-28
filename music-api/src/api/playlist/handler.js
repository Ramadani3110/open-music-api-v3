/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
const autobind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autobind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const { name } = request.payload;
      const { id: credentialsId } = request.auth.credentials;
      const playlistId = await this._service.addPlaylist({
        name,
        owner: credentialsId,
      });
      const response = h.response({
        status: "success",
        message: "Playlist berhasil ditambahkan",
        data: {
          playlistId,
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  //   verifyPlaylistOwner
  async getPlaylistHandler(request, h) {
    try {
      const { id: credentialsId } = request.auth.credentials;
      const playlists = await this._service.getPlaylist(credentialsId);

      return {
        status: "success",
        data: {
          playlists,
        },
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialsId } = request.auth.credentials;
      await this._service.verifyPlaylistOwner(id, credentialsId);
      await this._service.deletePlaylistById(id, credentialsId);

      return {
        status: "success",
        message: "Berhasil menghapus playlist",
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async postSongsToPlaylistHandler(request, h) {
    try {
      this._validator.validatePostWithSongPlaylistPayload(request.payload);
      const { id: credentialsId } = request.auth.credentials;
      const { playlistId } = request.params;
      const { songId } = request.payload;

      await this._service.verifyPlaylistAccess(playlistId, credentialsId);
      await this._service.addSongToPlaylist({ songId, playlistId });
      await this._service.addActivities({
        playlistId,
        songId,
        owner: credentialsId,
        action: "add",
      });
      const response = h.response({
        status: "success",
        message: "Berhasil menambahkan lagu ke playlist",
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async getSongsInPlaylistHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialsId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialsId);
      const playlist = await this._service.getSongInPlaylist(playlistId);

      const response = h.response({
        status: "success",
        data: {
          playlist,
        },
      });
      response.code(200);
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongsInPlaylistHandler(request, h) {
    try {
      this._validator.validatePostWithSongPlaylistPayload(request.payload);
      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialsId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(playlistId, credentialsId);
      await this._service.deleteSongInPlaylist(songId, playlistId);
      await this._service.addActivities({
        playlistId,
        songId,
        owner: credentialsId,
        action: "delete",
      });

      return {
        status: "success",
        message: "Lagu berhasil di hapus dari playlists",
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async getActivitiesHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialsId } = request.auth.credentials;

      await this._service.verifyPlaylistAccess(id, credentialsId);
      const activities = await this._service.getActivitiesById(id);

      const response = h.response({
        status: "success",
        data: {
          playlistId: id,
          activities,
        },
      });
      response.code(200);
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

      //   server error
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = PlaylistHandler;
