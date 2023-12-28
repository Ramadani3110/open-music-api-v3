/* eslint-disable no-else-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");
const NotFoundError = require("../../exceptions/NotFoundError");

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
    // this.postAlbumsHandler = this.postAlbumsHandler.bind(this);
  }

  async postAlbumsHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const { name = "untitled", year } = request.payload;
      const albumId = await this._service.addAlbums({ name, year });

      const response = h.response({
        status: "success",
        message: "Albums berhasil ditambahkan",
        data: {
          albumId,
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

  async getAlbumsByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const album = await this._service.getAlbumsById(id);
      const songs = await this._service.getSongInAmbum(id);
      const songInAlbum = { ...album, songs };
      return {
        status: "success",
        message: "Albums ditemukan",
        data: {
          album: songInAlbum,
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
      console.error(error);
      return response;
    }
  }

  async putAlbumsByIdHandler(request, h) {
    try {
      this._validator.validateAlbumsPayload(request.payload);
      const { id } = request.params;
      await this._service.editAlbumsById(id, request.payload);
      return {
        status: "success",
        message: "Albums berhasil diubah",
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

  async deleteAlbumsByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteAlbumsById(id);
      return {
        status: "success",
        message: "Berhasil menghapus albums",
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
}

module.exports = AlbumsHandler;
