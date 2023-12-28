/* eslint-disable comma-dangle */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("playlist_song_activities", {
    id: {
      type: "VARCHAR(50)",
      primaryKey: true,
      notNull: true,
    },
    playlist_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    song_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    user_id: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    action: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    time: {
      type: "VARCHAR(50)",
      notNull: true,
    },
  });
  //   add constraint playlist_id
  pgm.addConstraint(
    "playlist_song_activities",
    "fk_playlist_song_activities.playlist_id_playlist.id",
    "FOREIGN KEY(playlist_id) REFERENCES playlist(id) ON DELETE CASCADE"
  );

  //   add constraint song_id
  pgm.addConstraint(
    "playlist_song_activities",
    "fk_playlist_song_activities.song_id_songs.id",
    "FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE"
  );

  //   add constraint user_id
  pgm.addConstraint(
    "playlist_song_activities",
    "fk_playlist_song_activities.user_id_users.id",
    "FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("playlist_song_activities");
};
