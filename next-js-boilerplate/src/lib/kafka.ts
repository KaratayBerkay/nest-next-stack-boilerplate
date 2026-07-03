import "server-only";
import { Kafka, Producer } from "kafkajs";
import { serverEnv } from "./env";

const globalForKafka = globalThis as typeof globalThis & {
  __kafka?: Kafka;
  __producer?: Producer;
  __producerConnected?: boolean;
};

function kafka(): Kafka {
  globalForKafka.__kafka ??= new Kafka({
    clientId: "next-js-boilerplate",
    brokers: [serverEnv().KAFKA_BROKER],
  });
  return globalForKafka.__kafka;
}

async function producer(): Promise<Producer> {
  if (!globalForKafka.__producer) {
    globalForKafka.__producer = kafka().producer();
    globalForKafka.__producerConnected = false;
  }
  if (!globalForKafka.__producerConnected) {
    await globalForKafka.__producer.connect();
    globalForKafka.__producerConnected = true;
  }
  return globalForKafka.__producer;
}

export async function publishEvent(
  topic: string,
  event: Record<string, unknown>,
): Promise<void> {
  // KAFKA_BROKER=disabled (or empty) opts out of event publishing entirely —
  // deployments without the kafka compose profile otherwise retry-storm the logs.
  const broker = serverEnv().KAFKA_BROKER;
  if (!broker || broker === "disabled") return;
  const p = await producer();
  try {
    await p.send({
      topic,
      messages: [{ value: JSON.stringify(event) }],
    });
  } catch {
    // Connection may be stale — reset so the next call reconnects
    globalForKafka.__producerConnected = false;
    throw new Error("kafka publish failed");
  }
}
