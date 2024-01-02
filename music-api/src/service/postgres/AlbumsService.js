/* eslint-disable comma-dangle */
/* eslint-disable radix */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const autoBind = require("auto-bind");
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModelAlbums } = require("../../utils/albums");
const { mapDBToModelSongs } = require("../../utils/songs");

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addAlbums({ name, year }) {
    const id = `album-${nanoid(15)}`;
    const query = {
      text: "INSERT INTO albums VALUES($1,$2,$3) RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Album gagal ditambahkan");
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query("SELECT * FROM albums");
    return result.rows.map(mapDBToModelAlbums);
  }

  async getAlbumsById(id) {
    const query = {
      text: "SELECT * FROM albums WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Album tidak ditemukan");
    }
    return result.rows.map(mapDBToModelAlbums)[0];
  }

  async getSongInAmbum(id) {
    const query = {
      text: 'SELECT id,title,performer FROM songs WHERE "album_id" = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapDBToModelSongs);
  }

  async editAlbumsById(id, { name, year }) {
    const query = {
      text: "UPDATE albums SET name = $2, year = $3 WHERE id = $1 RETURNING id",
      values: [id, name, year],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal diubah Id tidak ditemukan");
    }
  }

  async deleteAlbumsById(id) {
    const query = {
      text: "DELETE FROM albums WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal dihapus Id tidak ditemukan");
    }
  }

  async editAlbumsCover(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET "coverUrl"= $1 WHERE id = $2 RETURNING id',
      values: [coverUrl, id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal diubah Id tidak ditemukan");
    }
  }

  async checkLikes(albumId, userId) {
    const query = {
      text: "SELECT user_id,album_id FROM user_albums_likes WHERE album_id = $1",
      values: [albumId],
    };
    const result = await this._pool.query(query);
    const albums = result.rows;

    albums.forEach((album) => {
      if (userId === album.user_id) {
        throw new InvariantError("Kamu sudah menyukai album ini");
      }
    });
  }

  async addLikes(albumId, userId) {
    const albums = {
      text: "SELECT id FROM albums WHERE id = $1",
      values: [albumId],
    };
    const resAlbums = await this._pool.query(albums);
    if (!resAlbums.rows.length) {
      throw new NotFoundError("Id album tidak ditemukan");
    }

    const id = `likes-${nanoid(15)}`;
    const query = {
      text: "INSERT INTO user_albums_likes VALUES($1,$2,$3) RETURNING id, album_id",
      values: [id, userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan like");
    }
    const album = result.rows[0].album_id;
    await this._cacheService.delete(`likes:${album}`);
  }

  async getLikes(albumId) {
    try {
      const count = await this._cacheService.get(`likes:${albumId}`);
      const likes = parseInt(count);
      const isCache = true;
      return { likes, isCache };
    } catch (error) {
      const query = {
        text: "SELECT COUNT(album_id) FROM user_albums_likes WHERE album_id = $1",
        values: [albumId],
      };
      const result = await this._pool.query(query);
      const countLikes = result.rows[0].count;

      const likes = parseInt(countLikes);
      const isCache = false;
      await this._cacheService.set(`likes:${albumId}`, JSON.stringify(likes));

      return { likes, isCache };
    }
  }

  async deleteLikes(albumId, userId) {
    const query = {
      text: "DELETE FROM user_albums_likes WHERE user_id = $1 AND album_id = $2 RETURNING id,album_id",
      values: [userId, albumId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError("Gagal diubah Id tidak ditemukan");
    }

    const album = result.rows[0].album_id;
    await this._cacheService.delete(`likes:${album}`);
  }
}
module.exports = AlbumsService;
