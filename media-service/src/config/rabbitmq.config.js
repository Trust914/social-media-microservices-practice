import {
  RABBITMQ_HOST,
  RABBITMQ_DEFAULT_PASS,
  RABBITMQ_PORT,
  RABBITMQ_DEFAULT_USER,
  RABBITMQ_VHOST,
} from "./env.config.js";

export const rabbitMQConfig = {
  protocol: "amqp",
  hostname: RABBITMQ_HOST,
  port: RABBITMQ_PORT,
  username: RABBITMQ_DEFAULT_USER,
  password: RABBITMQ_DEFAULT_PASS,
  // vhost: RABBITMQ_VHOST,
};
