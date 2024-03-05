import { Kafka } from "kafkajs";
import database from "../db_operation/chat.js";
import dotenv from 'dotenv'

dotenv.config()

 const kafka = new Kafka({
  clientId: "consumer-server-chat",
  brokers: [process.env.KAFKA_BROKER],
});
const chat_consumer = kafka.consumer({
  groupId: "chat-group",
  minBytes: 1024 * 1024, //? wait for 1 megabyte data to produced
  maxWaitTimeInMs: 10000, //? consume data at 10 sec interval
});

export const consumeChats = async () => {
  try {
    await database().connect()
    await chat_consumer.connect();
    await chat_consumer.subscribe({ topics: ["chat"] }); // handle messages collection in mongodb

    await chat_consumer.run({
      eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
        console.log(batch.messages.length + " new chat");
        // bulk insert payload => batch.messages.map((it) => JSON.parse(it.value))
        try {
          await database().addChats(
            batch.messages.map((it) => JSON.parse(it.value))
          );
          // resolveOffset(batch.lastOffset);
          await heartbeat();
        } catch (error) {
          throw error
        }
      },
    });
  } catch (error) {
    throw error;
  }
};
