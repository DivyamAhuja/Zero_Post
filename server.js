import dotenv from 'dotenv';

import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import { PubSub } from 'graphql-subscriptions';
import express from 'express';
import mongoose from 'mongoose';
import typeDefs from './graphql/typeDefs.js';
import resolvers from './graphql/resolvers/index.js';
import pubsub from './graphql/pubsub.js'
import cors from 'cors';
import * as path from 'path';

dotenv.config();

const app = express();

app.use(cors())
app.use(express.json({
    limit: '5mb'
}))
const prod = process.env.PROD || false;

app.use(express.static('public'))

if (prod) {
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(path.dirname('.'), 'public', 'index.html'))
    })
}


const httpServer = createServer(app);


const schema = makeExecutableSchema({ typeDefs, resolvers });

const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ req, pubsub }),
    plugins: [{
        async serverWillStart() {
            return {
                async drainServer() {
                    subscriptionServer.close();
                }
            };
        }
    }],
});

await server.start();
server.applyMiddleware({ app });

const subscriptionServer = SubscriptionServer.create({
    schema,
    execute,
    subscribe,
}, {
    server: httpServer,
    path: server.graphqlPath,
});



mongoose.connect(process.env.MONGODB, { useNewUrlParser: true })
    .then(() => {
        const PORT = process.env.PORT || 5000;
        return httpServer.listen(PORT, () => {
            console.log(
                `🚀 Query endpoint ready at http://localhost:${PORT}${server.graphqlPath}`
            );
            console.log(
                `🚀 Subscription endpoint ready at ws://localhost:${PORT}${server.graphqlPath}`
            );
        });
    });