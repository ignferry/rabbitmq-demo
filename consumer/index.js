// Library to connect and interact with rabbitmq
const amqp = require("amqplib");

var channel, connection;
setupRabbitmq();
async function setupRabbitmq() {
    try {
        connection = await amqp.connect("amqp://rabbitmq:5672");
        channel = await connection.createChannel();

        await channel.assertExchange(
            "amq.fanout",               // Exchange name
            "fanout",                   // Exchange type
            {
                durable: true           // Exchange will survive restart
            }
        );

        await channel.assertExchange(
            "amq.topic",
            "topic",
            {
                durable: true
            }
        );

        await channel.assertExchange(
            "amq.direct",
            "direct",
            {
                durable: true
            }
        );

        const { queue } = await channel.assertQueue(
            process.env.QUEUE_NAME,     // Queue name
            {
                durable: true           // Queue will survive restart
            }
        );

        channel.bindQueue(queue, "amq.fanout", "");
        channel.bindQueue(queue, "amq.topic", process.env.BINDING_PATTERN);
        channel.bindQueue(queue, "amq.direct", process.env.ROUTING_KEY);

        channel.consume(queue, (data) => {
            console.log("Received: ", data.content.toString());
            channel.ack(data)
        });

        console.log("Rabbitmq setup DONE");
    } catch (err) {
        console.log(err);
    }
}