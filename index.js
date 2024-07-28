import dotenv from "dotenv";
import {
  consumeChats,
  consumeSentAck,
  consumeUserJoinedChatServer,
  consumeUserSeenMsg,
} from "./consumer_service/chat.js";
import { consumeNotification } from "./consumer_service/notification.js";
import mongose from "mongoose";

dotenv.config();
async function dbConnect() {
  try {
    await mongose.connect(process.env.MONGO_URL_CHAT);
    console.log("connected to CHAT DB");
  } catch (error) {
    console.log("consumer server database connecting error\n", error);
    throw error;
  }
}

dbConnect()
  .then(() => {
    // when a user open chat all single tick message updated to double tick
    consumeUserJoinedChatServer()
      .then(() => {
        console.log("monitering user online");
      })
      .catch((err) => console.log("online user monitor Error :", err));
    // when someone sent message to you and you are online update status to "sent"
    consumeSentAck()
      .then(() => console.log("\nConsuming sent acknowledgement... \n"))
      .catch((err) => console.log("sent acknowledgement Error :", err));
    // when some one sent message write to db
    consumeChats()
      .then(() => console.log("\nConsuming Chats... \n"))
      .catch((err) => console.log("Chat Consume Error :", err));
    // when user seen message update the status
    consumeUserSeenMsg()
      .then(() => console.log("\nConsuming seen... \n"))
      .catch((err) => console.log("seen Consume Error :", err));

    consumeNotification()
      .catch((err) => console.log("Notification Consume Error :", err))
      .then(() => console.log("\nConsuming Notif... \n"));
  })
  .catch((er) => {
    // console.log('er', er)
  });
