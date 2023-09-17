const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

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
                durable: true           // Exchange contents will survive restart
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

        console.log("Rabbitmq setup DONE");
    } catch (err) {
        console.log(err);
    }
}


app.use(express.json());

app.post("/fanout", (req, res) => {
    let message = req.body.message;

    channel.publish("amq.fanout", "", Buffer.from(message));

    console.log(`Message '${message}' has been sent to the fanout exchange.`);

    res.status(200).json(
        {
            message: `Message '${message}' has been sent to the fanout exchange.`
        }
    );
});

app.post("/topic", (req, res) => {
    let message = req.body.message;
    let routingKey = req.body.routing_key;
    
    channel.publish("amq.topic", routingKey, Buffer.from(message));

    console.log(`Message '${message}' with routing key '${routingKey}' has been sent to the topic exchange.`);

    res.status(200).json(
        {
            message: `Message '${message}' with routing key '${routingKey}' has been sent to the topic exchange.`
        }
    );
});

app.post("/direct", (req, res) => {
    let message = req.body.message;
    let routingKey = req.body.routing_key;
    
    channel.publish("amq.direct", routingKey, Buffer.from(message));

    console.log(`Message '${message}' with routing key '${routingKey}' has been sent to the direct exchange.`);

    res.status(200).json(
        {
            message: `Message '${message}' with routing key '${routingKey}' has been sent to the direct exchange.`
        }
    );
});

app.listen(PORT, () => {
    console.log("Producer Server running at port " + PORT);
})
