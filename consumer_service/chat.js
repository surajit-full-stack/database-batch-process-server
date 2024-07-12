import { Kafka } from "kafkajs";
import database from "../db_operation/chat.js";
import dotenv from "dotenv";

dotenv.config();

const kafka = new Kafka({
  clientId: "consumer-server-chat",
  brokers: [process.env.KAFKA_BROKER],
});
const chat_consumer = kafka.consumer({
  groupId: "chat-group",
  minBytes: 1024 * 1024, //? wait for 1 megabyte data to produced
  maxWaitTimeInMs: 10000, //? consume data at 10 sec interval
});


const sent_status_consumer = kafka.consumer({
  groupId: "sent-status-group",
});
const seen_status_consumer = kafka.consumer({
  groupId: "seen-status-group",
});
export const consumeChats = async () => {
  try {
    await chat_consumer.connect();
    await chat_consumer.subscribe({ topics: ["chat"] }); // handle messages collection in mongodb

    await chat_consumer.run({
      eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
        // bulk insert payload => batch.messages.map((it) => JSON.parse(it.value))
        try {
          await database().addChats(
            batch.messages.map((it) => JSON.parse(it.value))
          );
          // resolveOffset(batch.lastOffset);
          await heartbeat();
        } catch (error) {
          console.log("dbbbb");
          throw error;
        }
      },
    });
  } catch (error) {
    throw error;
  }
};

export const consumeUserJoinedChatServer = async () => {
  try {
    await sent_status_consumer.connect();
    await sent_status_consumer.subscribe({ topics: ["user-online-status"] });
    await sent_status_consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        console.log({
          partition,
          offset: message.offset,
          value: message.value.toString(),
        });
        await database().deliveredStatusUpdate(message.value.toString());
      },
    });
  } catch (error) {
    console.log('error', error)
  }
};
export const consumeUserSeenMsg = async () => {
  try {
    await seen_status_consumer.connect();
    await seen_status_consumer.subscribe({ topics: ["seen-msg-db-write"] });
    await seen_status_consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const packet = JSON.parse(message.value)
       
        console.log(
          packet
        ,"user seen handle");
        await database().seenStatusUpdate(packet);
      },
    });
  } catch (error) {
    console.log('error', error)
  }
};
