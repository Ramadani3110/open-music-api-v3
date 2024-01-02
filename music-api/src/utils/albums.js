/* eslint-disable object-curly-newline */
const mapDBToModelAlbums = ({ id, name, year, coverUrl }) => ({
  id,
  name,
  year,
  coverUrl,
});

module.exports = { mapDBToModelAlbums };
