/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable comma-dangle */
class Listener {
  constructor(playlistService, mailSender) {
    this._playlistService = playlistService;
    this._mailSender = mailSender;

    this.listen = this.listen.bind(this);
  }

  async listen(message) {
    try {
      const { userId, targetEmail, playlist_id } = JSON.parse(
        message.content.toString()
      );
      const playlist = await this._playlistService.getSongInPlaylist(
        playlist_id
      );
      const result = await this._mailSender.sendEmail(
        targetEmail,
        JSON.stringify(playlist)
      );
      console.log(result);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = Listener;
