/* eslint-disable no-unused-vars */
const routes = (handler) => [
  {
    method: "POST",
    path: "/songs",
    handler: handler.postSongsHandler,
  },
  {
    method: "GET",
    path: "/songs",
    handler: handler.getSongsHandler,
  },
  {
    method: "GET",
    path: "/songs/{songsId}",
    handler: handler.getSongsByIdHandler,
  },
  {
    method: "PUT",
    path: "/songs/{songsId}",
    handler: handler.putSongsByIdHandler,
  },
  {
    method: "DELETE",
    path: "/songs/{songsId}",
    handler: handler.deleteSongsByIdHandler,
  },
];

module.exports = routes;
