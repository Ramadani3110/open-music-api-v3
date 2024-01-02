/* eslint-disable comma-dangle */
/* eslint-disable no-else-return */
/* eslint-disable no-console */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const autoBind = require("auto-bind");
const ClientError = require("../../exceptions/ClientError");

class AlbumsHandler {
  constructor(service, storageService, validator, uploadValidator) {
    this._service = service;
    this._storageService = storageService;
    this._validator = validator;
    this._uploadValidator = uploadValidator;

    autoBind(this);
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

  async postAlbumsCoversHandler(request, h) {
    try {
      const { id } = request.params;
      const { cover } = request.payload;
      const contentLength = request.headers["content-length"];

      this._uploadValidator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._storageService.writeFile(
        cover,
        cover.hapi,
        contentLength
      );

      const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._service.editAlbumsCover(id, coverUrl);

      const response = h.response({
        status: "success",
        message: "Sampul berhasil diunggah",
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
      console.error(error);
      return response;
    }
  }

  async postLikesHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialsId } = request.auth.credentials;
      await this._service.checkLikes(id, credentialsId);
      await this._service.addLikes(id, credentialsId);

      const response = h.response({
        status: "success",
        message: "Berhasil like albums",
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
      console.error(error);
      return response;
    }
  }

  async deleteLikesHandler(request, h) {
    try {
      const { id } = request.params;
      const { id: credentialsId } = request.auth.credentials;
      await this._service.deleteLikes(id, credentialsId);

      return {
        status: "success",
        message: "Berhasil unlike albums",
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

  async getLikesHandler(request, h) {
    try {
      const { id } = request.params;
      const { likes, isCache } = await this._service.getLikes(id);
      if (isCache) {
        const response = h.response({
          status: "success",
          message: "Berhasil",
          data: {
            likes,
          },
        });
        response.code(200);
        response.header("X-Data-Source", "cache");
        return response;
      }

      const response = h.response({
        status: "success",
        message: "Berhasil",
        data: {
          likes,
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
        status: "error",
        message: "Maaf terjadi kesalahan di server kami",
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = AlbumsHandler;
