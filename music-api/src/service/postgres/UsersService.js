/* eslint-disable comma-dangle */
/* eslint-disable class-methods-use-this */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const { nanoid } = require("nanoid");
const InvariantError = require("../../exceptions/InvariantError");
const AuthenticationError = require("../../exceptions/AuthenticationError");

class UsersService {
  constructor() {
    this._pool = new Pool();
  }

  async addUser({ username, password, fullname }) {
    await this.checkNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);

    const query = {
      text: "INSERT INTO users VALUES($1,$2,$3,$4) RETURNING id",
      values: [id, username, hashedPassword, fullname],
    };
    // console.log("id ", id);
    // console.log("password hash : ", hashedPassword);
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new InvariantError("Gagal menambahkan user");
    }
    return result.rows[0].id;
  }

  async checkNewUsername(username) {
    const query = {
      text: "SELECT username FROM users WHERE username = $1",
      values: [username],
    };
    const result = await this._pool.query(query);
    if (result.rows.length) {
      throw new InvariantError(
        "Gagal menambahkankan user. Username sudah digunakan"
      );
    }
  }

  async checkCredentials(username, password) {
    const query = {
      text: "SELECT id,password FROM users WHERE username = $1",
      values: [username],
    };

    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError("Kredensial yang diberikan salah");
    }

    const { id, password: hashedPassword } = result.rows[0];
    const match = await bcrypt.compare(password, hashedPassword);

    if (!match) {
      throw new AuthenticationError("Kredensial yang diberikan salah");
    }

    return id;
  }
}

module.exports = UsersService;
