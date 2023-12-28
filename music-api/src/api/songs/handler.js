/* eslint-disable operator-linebreak */
/* eslint-disable object-curly-newline */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongsHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const { id, title, year, genre, performer, duration, albumId } =
        request.payload;

      const songId = await this._service.addSongs({
        id,
        title,
        year,
        genre,
        performer,
        duration: duration || null,
        albumId: albumId || null,
      });
      const response = h.response({
        status: "success",
        message: "Berhasl menambahkan lagu",
        data: {
          songId,
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

      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async getSongsHandler(request, h) {
    try {
      const { title, performer } = request.query;
      const songs = await this._service.getAllSongs(title, performer);
      return {
        status: "success",
        message: "Berhasil menampilkan semua lagu",
        data: {
          songs,
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
      const response = h.response({
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async getSongsByIdHandler(request, h) {
    try {
      const { songsId } = request.params;
      const song = await this._service.getSongsById(songsId);
      const response = h.response({
        status: "success",
        message: "Lagu ditemukan",
        data: {
          song,
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
      const response = h.response({
        status: "fail",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      //   console.error(error);
      return response;
    }
  }

  async putSongsByIdHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const { songsId } = request.params;
      await this._service.editSongsById(songsId, request.payload);
      return {
        status: "success",
        message: "Berhasil mengubah lagu",
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
      const response = h.response({
        status: "fail",
        message: "Maad terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }

  async deleteSongsByIdHandler(request, h) {
    try {
      const { songsId } = request.params;
      await this._service.deleteSongsById(songsId);
      return {
        status: "success",
        message: "Berhasil menghapus lagu",
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
      const response = h.response({
        status: "fail",
        message: "Maad terjadi kesalahan di server kami",
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = SongsHandler;
