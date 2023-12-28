/* eslint-disable no-tabs */
/* eslint-disable comma-dangle */
/* eslint-disable object-curly-newline */
/* eslint-disable no-underscore-dangle */
const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const InvariantError = require("../../exceptions/InvariantError");
const AuthorizationError = require("../../exceptions/AuthorizationError");
const NotFoundError = require("../../exceptions/NotFoundError");

class PlaylistService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(15)}`;
    const query = {
      text: "INSERT INTO playlist VALUES($1,$2,$3) RETURNING id",
      values: [id, name, owner],
    };
    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError("Gagal menambahkan playlist");
    }

    return result.rows[0].id;
  }

  async getPlaylist(owner) {
    const query = {
      text: "SELECT playlist.id,playlist.name,users.username FROM playlist LEFT JOIN users ON playlist.owner = users.id LEFT JOIN collaborations ON collaborations.playlist_id = playlist.id WHERE playlist.owner = $1 OR collaborations.user_id = $1",
      values: [owner],
    };

    const result = await this._pool.query(query);
    const toMap = result.rows.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));

    return toMap;
  }

  async deletePlaylistById(id, userId) {
    const queryUser = {
      text: "SELECT id FROM users WHERE id = $1",
      values: [userId],
    };
    const queryPlaylist = {
      text: "SELECT owner FROM playlist WHERE id = $1",
      values: [id],
    };
    const resUser = await this._pool.query(queryUser);
    const resPlaylist = await this._pool.query(queryPlaylist);

    const user = resUser.rows[0];
    const playlist = resPlaylist.rows[0];

    if (user.id !== playlist.owner) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }

    const query = {
      text: "DELETE FROM playlist WHERE id = $1 RETURNING id",
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Gagal menghapus. Id tidak ditemukan");
    }
  }

  async addSongToPlaylist({ songId, playlistId }) {
    const querySong = {
      text: "SELECT * FROM songs WHERE id = $1",
      values: [songId],
    };

    const resSong = await this._pool.query(querySong);
    if (!resSong.rows.length) {
      throw new NotFoundError("Gagal menambahkan. id lagu tidak ditemukan");
    }

    const id = `playlist-song-${nanoid(10)}`;
    const queryPlaylist = {
      text: "INSERT INTO playlist_songs VALUES($1,$2,$3)",
      values: [id, playlistId, songId],
    };

    await this._pool.query(queryPlaylist);
  }

  async getSongInPlaylist(playlistId) {
    const queryPlaylist = {
      text: "SELECT playlist.id,playlist.name,users.username FROM playlist LEFT JOIN users ON playlist.owner = users.id WHERE playlist.id = $1 ",
      values: [playlistId],
    };

    const querySongs = {
      text: "SELECT songs.id,songs.title,songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1",
      values: [playlistId],
    };

    const resPlaylist = await this._pool.query(queryPlaylist);
    const resSongs = await this._pool.query(querySongs);

    if (!resPlaylist.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }

    return {
      id: resPlaylist.rows[0].id,
      name: resPlaylist.rows[0].name,
      username: resPlaylist.rows[0].username,
      songs: resSongs.rows,
    };
  }

  async deleteSongInPlaylist(songId, playlistId) {
    const query = {
      text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menghapus. Id lagu tidak ditemukan");
    }
  }

  // activities
  async addActivities({ playlistId, songId, owner, action }) {
    const id = `activities-${nanoid(10)}`;
    const time = new Date().toISOString();

    const query = {
      text: "INSERT INTO playlist_song_activities VALUES($1,$2,$3,$4,$5,$6) RETURNING id",
      values: [id, playlistId, songId, owner, action, time],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan activities");
    }
  }

  async getActivitiesById(playlistId) {
    const queryCheck = {
      text: "SELECT playlist_id FROM playlist_song_activities WHERE playlist_id = $1",
      values: [playlistId],
    };
    const resCheck = await this._pool.query(queryCheck);
    if (!resCheck.rows.length) {
      throw NotFoundError("Playlist tidak ada");
    }

    const queryActivities = {
      text: `SELECT users.username,songs.title,playlist_song_activities.action,
      playlist_song_activities.time FROM playlist_song_activities
      INNER JOIN users ON playlist_song_activities.user_id = users.id 
      INNER JOIN songs ON playlist_song_activities.song_id = songs.id 
      WHERE playlist_song_activities.playlist_id = $1`,
      values: [playlistId],
    };

    const resActivities = await this._pool.query(queryActivities);

    const mapActivities = resActivities.rows.map((act) => ({
      username: act.username,
      title: act.title,
      action: act.action,
      time: act.time,
    }));

    return mapActivities;
  }

  async verifyPlaylistOwner(playlistId, userId) {
    const query = {
      text: `SELECT
      p.owner as owner,
	    c.user_id as user_id
    FROM
      playlist p
    LEFT JOIN 
      collaborations c ON p.id = c.playlist_id AND c.user_id = $1
    WHERE
      p.id = $2`,
      values: [userId, playlistId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError("Playlist tidak ditemukan");
    }
    const playlist = result.rows[0];
    if (playlist.owner !== userId && playlist.user_id !== userId) {
      throw new AuthorizationError("Anda tidak berhak mengakses playlist ini");
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationsService.verifyCollaboration(
          playlistId,
          userId
        );
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistService;
