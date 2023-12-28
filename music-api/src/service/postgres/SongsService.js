/* eslint-disable camelcase */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable class-methods-use-this */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const { mapDBToModelSongs } = require("../../utils/songs");

class SongsService {
  constructor() {
    this._pool = new Pool();
  }

  async addSongs({ title, year, performer, genre, duration, albumId }) {
    const id = `song-${nanoid(15)}`;
    const query = {
      text: "INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
      values: [id, title, year, performer, genre, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError("Lagu gagal ditambahkan");
    }
    return result.rows[0].id;
  }

  async getAllSongs(title, performer) {
    let result = await this._pool.query("SELECT id,title,performer FROM songs");

    if (title !== undefined) {
      const query = {
        text: "SELECT id,title,performer FROM songs WHERE LOWER(title) LIKE $1",
        values: [`%${title}%`],
      };
      result = await this._pool.query(query);
    }

    if (performer !== undefined) {
      const query = {
        text: "SELECT id,title,performer FROM songs WHERE LOWER(performer) LIKE $1",
        values: [`%${performer}%`],
      };
      result = await this._pool.query(query);
    }

    return result.rows.map(mapDBToModelSongs);
  }

  async getSongsById(id) {
    const query = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Id lagu tidak ditemukan");
    }
    return result.rows.map(mapDBToModelSongs)[0];
  }

  async editSongsById(
    id,
    { title, year, performer, genre, duration, album_id }
  ) {
    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, "album_id" = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, album_id, id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal diubah id tidak ditemukan");
    }
  }

  async deleteSongsById(id) {
    const query = {
      text: "DELETE FROM songs WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus id tidak ditemukan");
    }
  }
}

module.exports = SongsService;
