/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("albums", {
    id: {
      type: "VARCHAR(50)",
      notNull: true,
      primaryKey: true,
    },
    name: {
      type: "VARCHAR(50)",
      notNull: true,
    },
    year: {
      type: "INTEGER",
      notNull: true,
    },
    coverUrl: {
      type: "VARCHAR(100)",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("albums");
};
