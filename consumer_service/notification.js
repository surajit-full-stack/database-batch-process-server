import { Kafka } from "kafkajs";
import dotenv from 'dotenv'
import database from "../db_operation/notification.js";

dotenv.config()


const kafka = new Kafka({
  clientId: "consumer-server-notification",
  brokers: [process.env.KAFKA_BROKER],
});
export const notification_consumer = kafka.consumer({
    groupId: "notification-group-consumer",
    minBytes: 1024 * 1024, //? wait for 1 megabyte data to produced
    maxWaitTimeInMs: 30000, //? consume data at 30 sec interval
  });

  export const consumeNotification = async () => {
    try {
      await database().connect()
      await notification_consumer.connect();
      await notification_consumer.subscribe({ topics: ["notification-new","notification-others"] }); // handle messages collection in mongodb

  
      await notification_consumer.run({
        eachBatch: async ({ batch }) => {
          // bulk insert payload => batch.messages.map((it) => JSON.parse(it.value))
          console.log('batch', batch.messages.length)
        },
      });
    } catch (error) {
      throw error;
    }
  };