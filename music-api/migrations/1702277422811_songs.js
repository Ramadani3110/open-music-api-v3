/* eslint-disable comma-dangle */
/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("songs", {
    id: {
      type: "VARCHAR(50)",
      notNull: true,
      primaryKey: true,
    },
    title: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    year: {
      type: "INTEGER",
      notNull: true,
    },
    performer: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    genre: {
      type: "VARCHAR(80)",
      notNull: true,
    },
    duration: {
      type: "INTEGER",
      notNull: false,
    },
    album_id: {
      type: "VARCHAR(50)",
      notNull: false,
    },
  });

  // add foreign key albums id
  pgm.addConstraint(
    "songs",
    "fk_songs.album_id_albums.id",
    "FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE"
  );
};

exports.down = (pgm) => {
  pgm.dropTable("songs");
};
