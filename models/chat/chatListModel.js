function ChatListModel(data) {
    this._id = data.id;
    this.name = data.name;
    this.userId = data.user_id;
    this.friendsId = data.friend_id;
    this.senderId = data.sender_id;
    this.messageStatus = data.message_status;
    // this.message = data.message;
    this.createdAt = data.created_at;
}

module.exports = { ChatListModel };
