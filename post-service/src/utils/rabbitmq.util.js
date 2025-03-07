import amqp from "amqplib";
import { logger } from "../utils/logger.util.js";
import { rabbitMQConfig } from "../config/rabbitmq.config.js";

const EXCHANGE_NAME = "post_events";
let connection, channel;

export const connectToRabbitMQ = async () => {
  try {
    logger.debug(`Attempting to connect to RabbitMQ with config:`, rabbitMQConfig);
    
    
    connection = await amqp.connect(rabbitMQConfig);
    channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE_NAME, "topic", { durable: false });
    logger.info(`Successfully connected to RabbitMQ`);
    
    connection.on('error', (err) => {
      logger.error(`RabbitMQ connection error: ${err.message}`);
    });
    
    return channel;
  } catch (error) {
    logger.error(`RabbitMQConnError-${error.name}`, {
      info: error.message,
      cause: error.cause,
      stack: error.stack
    });
    
    logger.info('Attempting to reconnect to RabbitMQ in 5 seconds...');
  }
};

export const publichEvent = async (routingKey, message) => {
  try {
    if (!channel || !channel.connection) {
      await connectToRabbitMQ();
    }

    channel.publish(
      EXCHANGE_NAME,
      routingKey,
      Buffer.from(JSON.stringify(message))
    );
    logger.info(`Event published : ${routingKey}`);
  } catch (error) {
    logger.error(`Error publishing message: ${error.message}`);
  }
};

export const consumeEvent = async (routingKey, callback) => {
  try {
    if (!channel || !channel.connection) {
      await connectToRabbitMQ();
    }

    const q = await channel.assertQueue("", { exclusive: true });
    
    await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);
    channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        try {
          const content = JSON.parse(msg.content.toString());
          callback(content);
          channel.ack(msg);
        } catch (error) {
          logger.error(`Error processing message: ${error.message}`);
          channel.nack(msg, false, false); 
        }
      }
    });
    logger.info(`Subscribed to event : ${routingKey}`);
  } catch (error) {
    logger.error(`Error consuming event: ${error.message}`);
  }
};