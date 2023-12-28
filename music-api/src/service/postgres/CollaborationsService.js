/* eslint-disable no-tabs */
/* eslint-disable comma-dangle */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const AuthorizationError = require("../../exceptions/AuthorizationError");

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const checkUser = {
      text: "SELECT * FROM users WHERE id = $1",
      values: [userId],
    };
    const resCheck = await this._pool.query(checkUser);
    if (!resCheck.rows.length) {
      throw new NotFoundError("User tidak ada");
    }

    const id = `collab-${nanoid(5)}`;
    const query = {
      text: "INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id",
      values: [id, playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan kolaborasi");
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId, owner) {
    const queryPlaylist = {
      text: "SELECT owner FROM playlist WHERE id = $1",
      values: [playlistId],
    };
    const resPlaylist = await this._pool.query(queryPlaylist);

    const playlist = resPlaylist.rows[0];

    if (owner !== playlist.owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }
    const query = {
      text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menghapus kolaborasi");
    }
  }

  async verifyCollaboration(playlistId, userId) {
    const query = {
      text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Kolaborasi gagal di verifikasi");
    }
  }
}

module.exports = CollaborationsService;
