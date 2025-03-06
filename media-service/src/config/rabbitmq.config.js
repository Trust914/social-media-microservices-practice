import {
  RABBITMQ_HOST,
  RABBITMQ_PASS,
  RABBITMQ_PORT,
  RABBITMQ_USER,
  RABBITMQ_VHOST,
} from "./env.config.js";

export const rabbitMQConfig = {
  protocol: "amqp",
  hostname: RABBITMQ_HOST,
  port: RABBITMQ_PORT,
  username: RABBITMQ_USER,
  password: RABBITMQ_PASS,
  vhost: RABBITMQ_VHOST,
};
