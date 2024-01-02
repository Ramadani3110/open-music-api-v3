/* eslint-disable camelcase */
/* eslint-disable no-underscore-dangle */
const { Pool } = require("pg");

class PlaylistService {
  constructor() {
    this._pool = new Pool();
  }

  async getSongInPlaylist(playlist_id) {
    const queryPlaylist = {
      text: "SELECT playlist.id,playlist.name,users.username FROM playlist LEFT JOIN users ON playlist.owner = users.id WHERE playlist.id = $1",
      values: [playlist_id],
    };

    const querySongs = {
      text: "SELECT songs.id,songs.title,songs.performer FROM songs INNER JOIN playlist_songs ON songs.id = playlist_songs.song_id WHERE playlist_songs.playlist_id = $1",
      values: [playlist_id],
    };

    const resPlaylist = await this._pool.query(queryPlaylist);
    const resSongs = await this._pool.query(querySongs);

    return {
      playlist: {
        id: resPlaylist.rows[0].id,
        name: resPlaylist.rows[0].name,
        songs: resSongs.rows,
      },
    };
  }
}

module.exports = PlaylistService;
