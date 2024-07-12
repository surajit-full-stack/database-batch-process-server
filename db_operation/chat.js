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
    type: String,
  },
});

const Message = mongose.model("Message", MessageSchema);

class ChatDb {
  async addChats(chats) {
    // []{senderName, receiverName, text, time, status, id}

    try {
      console.log("chats", chats);

      await Message.insertMany(chats);
      console.log("added");
    } catch (error) {
      console.log(" batch error", error);
    }
  }

  async deliveredStatusUpdate(receiverName) {
    try {
      const data = await Message.updateMany(
        { receiverName, status: "offline" },
        { status: "sent" }
      );
      console.log("updated", data);
    } catch (error) {
      console.log("error", error);
    }
  }
  async seenStatusUpdate(parties) {
    const { reciverName, senderName } = parties;
    try {
      const data = await Message.updateMany(
        { receiverName: reciverName, senderName, status: { $ne: "offline" } },
        { status: "seen" }
      );
      console.log(" seen updated", data);
    } catch (error) {
      console.log("error", error);
    }
  }
}

const database = () => {
  return new ChatDb();
};
export default database;
