/* eslint-disable no-underscore-dangle */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
require("dotenv").config();
// hapi
const Hapi = require("@hapi/hapi");
const Jwt = require("@hapi/jwt");

// albums
const albums = require("./api/albums");
const AlbumsService = require("./service/postgres/AlbumsService");
const AlbumsValidator = require("./validator/music/albums");

// songs
const songs = require("./api/songs");
const SongsService = require("./service/postgres/SongsService");
const SongsValidator = require("./validator/music/songs");

// users
const users = require("./api/users");
const UsersService = require("./service/postgres/UsersService");
const UsersValidator = require("./validator/music/users");

// authentications
const authentications = require("./api/authentications");
const AuthenticationsService = require("./service/postgres/AuthenticationsService");
const AuthenticationsValidator = require("./validator/music/authentication");
const TokenManager = require("./tokenize/TokenManager");

// playlist
const playlist = require("./api/playlist");
const PlaylistService = require("./service/postgres/PlaylistService");
const PlaylistValidator = require("./validator/music/playlist");

// collaborations
const collaborations = require("./api/collaborations");
const CollaborationsService = require("./service/postgres/CollaborationsService");
const CollaborationValidator = require("./validator/music/collaborations");

// exports
const _exports = require("./api/exports");
const ProducerService = require("./service/rabbitmq/ProducerService");
const ExportsValidator = require("./validator/music/exports");

const init = async () => {
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistService = new PlaylistService(collaborationsService);
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ["*"],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  server.auth.strategy("musicv2_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        exportsService: ProducerService,
        playlistService,
        validator: ExportsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan di ${server.info.uri}`);
};
init();
