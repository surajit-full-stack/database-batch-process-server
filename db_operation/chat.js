import mongose from "mongoose";

// Define schema for Message
const MessageSchema = new mongose.Schema({
  receiverName: String,
  text: String,
  senderName: String,
  time: Date,
  id: String,
  status: String,
  conversation_id: {
    type: String
  },
});

const Message = mongose.model("Message", MessageSchema);

class ChatDb {
  async connect() {
    try {
      await mongose.connect(process.env.MONGO_URL_CHAT);
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
