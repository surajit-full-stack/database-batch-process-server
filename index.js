import dotenv from "dotenv";
import { consumeChats, consumeUserJoinedChatServer } from "./consumer_service/chat.js";
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


dbConnect().then(() => {
  consumeUserJoinedChatServer().then(()=>{
    console.log('monitering user online')
  })
  .catch((err) => console.log("online user monitor Error :", err));

  consumeChats()
    .then(() => console.log("\nConsuming Chats... \n"))
    .catch((err) => console.log("Chat Consume Error :", err));

  consumeNotification()
    .catch((err) => console.log("Notification Consume Error :", err))
    .then(() => console.log("\nConsuming Notif... \n"));
}).catch((er)=>{
  // console.log('er', er)
})
