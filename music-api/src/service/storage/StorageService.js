/* eslint-disable no-underscore-dangle */
const fs = require("fs");
const FileSizeError = require("../../exceptions/FileSizeError");

class StorageService {
  constructor(folder) {
    this._folder = folder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }
  }

  writeFile(file, meta, contentLength) {
    const maxSize = 512000;

    if (contentLength >= maxSize) {
      throw new FileSizeError("Ukuran file terlalu besar! (max 512000)");
    }

    const filename = +new Date() + meta.filename;
    const path = `${this._folder}/${filename}`;

    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
      fileStream.on("error", (error) => reject(error));
      file.pipe(fileStream);
      file.on("end", () => resolve(filename));
    });
  }
}

module.exports = StorageService;
