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
  constructor() {
    this._pool = new Pool();
    autoBind(this);
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
}
module.exports = AlbumsService;
