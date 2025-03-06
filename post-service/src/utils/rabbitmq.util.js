import amqp from "amqplib";
import { logger } from "../utils/logger.util.js";
import { rabbitMQConfig } from "../config/rabbitmq.config.js";

const EXCHANGE_NAME = "post_events";
let connection, channel;

export const connectToRabbitMQ = async () => {
  try {
    connection = await amqp.connect(rabbitMQConfig);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info(`Successfully connected to RabbitMQ`);
    return channel;
  } catch (error) {
    logger.error(`RabbitMQConnError-${error.name}`, {
      info: error.message,
      cause: error.cause,
    });
  }
};

export const publichEvent = async (routingKey, message) => {
  if (!channel) {
    await connectToRabbitMQ();
  }

  channel.publish(
    EXCHANGE_NAME,
    routingKey,
    Buffer.from(JSON.stringify(message))
  );
  logger.info(`Event published : ${routingKey}`);
};

