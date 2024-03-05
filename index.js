import dotenv from "dotenv";
import { consumeChats } from "./consumer_service/chat.js";
import { consumeNotification } from "./consumer_service/notification.js";

dotenv.config();


consumeChats()
  .then(() => console.log("\nConsuming Chats... \n"))
  .catch((err) => console.log("Chat Consume Error :", err));

consumeNotification().catch((err) =>
  console.log("Notification Consume Error :", err)
).then(() => console.log("\nConsuming Notif... \n"))
