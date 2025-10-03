import mqtt, { MqttClient } from "mqtt";

export function createMQTTClient(broker: string) {
    return mqtt.connect(broker);
}
