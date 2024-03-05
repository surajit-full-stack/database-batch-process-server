import mongose from "mongoose";

const UserSchema = new mongose.Schema({
  userName: {
    type: String,
    unique: true,
  },
});

// Define schema for Friend
const FriendSchema = new mongose.Schema({
  user_id: { type: String },
  friend_id: { type: String },
  last_message: String,
});

// Define schema for Message
const MessageSchema = new mongose.Schema({
  receiverName: String,
  text: String,
  senderName: String,
  time: Date,
  id: String,
  status: String,
});

// const User = mongose.model("User", UserSchema);
const Friend = mongose.model("Friend", FriendSchema);
const Message = mongose.model("Message", MessageSchema);

class ChatDb {
  async connect() {
    try {
      await mongose.connect(process.env.MONGO_URL_CHAT)
      console.log("connected to CHAT DB");
    } catch (error) {
      console.log("error", error);
    }
  }

  async addChats(chats) {
    // []{senderName, receiverName, text, time, status, id}

    try {
      console.log("chats", chats);
      await Message.insertMany(chats);
      console.log("added");
    } catch (error) {
      console.log("error", error);
    }
  }
}

const database = () => {
  return new ChatDb();
};
export default database;
