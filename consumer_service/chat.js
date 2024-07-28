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
  maxWaitTimeInMs: 3000, //? consume data at 3 sec interval
});

// when user enter chat app first time
const sent_status_consumer = kafka.consumer({
  groupId: "sent-status-group",
});

const seen_status_consumer = kafka.consumer({
  groupId: "seen-status-group",
});

// when user already online
const sent_ack_consumer = kafka.consumer({
  groupId: "sent-ack-group",
});

export const consumeChats = async () => {
  try {
    await chat_consumer.connect();
    await chat_consumer.subscribe({ topics: ["chat"] }); // handle messages collection in mongodb

    await chat_consumer.run({
      eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
        // bulk insert payload => batch.messages.map((it) => JSON.parse(it.value))

        try {
          console.log("Batch : ", batch.messages.length);

          await database().addChats(
            batch.messages.map((it) => JSON.parse(it.value))
          );
          // resolveOffset(batch.lastOffset);
          await heartbeat();
        } catch (error) {
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
        const { userId } = JSON.parse(message.value);
        await database().deliveredStatusUpdate(userId);
      },
    });
  } catch (error) {
    console.log("Error:\n", error);
  }
};
export const consumeUserSeenMsg = async () => {
  try {
    await seen_status_consumer.connect();
    await seen_status_consumer.subscribe({ topics: ["seen-msg-db-write"] });
    await seen_status_consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const packet = JSON.parse(message.value);

        await database().seenStatusUpdate(packet);
      },
    });
  } catch (error) {
    console.log("Error:\n", error);
  }
};
export const consumeSentAck = async () => {
  try {
    await sent_ack_consumer.connect();
    await sent_ack_consumer.subscribe({ topics: ["ACK"] });
    await sent_ack_consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const { id } = JSON.parse(message.value);

        if (id) await database().markChatAsSentById(id);
      },
    });
  } catch (error) {
    console.log("Error:\n", error);
  }
};
