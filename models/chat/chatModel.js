function ChatModel(data) {
    this._id = data.id;
    this.sendBy = data.send_by;
    this.sendTo = data.send_to;
    this.message = data.message;
    this.createdAt = data.created_at;
}

module.exports = { ChatModel };
