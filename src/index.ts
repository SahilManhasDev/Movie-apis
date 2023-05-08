import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createConnection } from "typeorm";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs";

dotenv.config();

const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || "";
const DATABASE_URL = process.env.DATABASE_URL || "";

async function startServer() {
    const app = express();

    app.use(cors());

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => ({ req }),
    });

    await createConnection({
        type: "postgres",
        url: DATABASE_URL,
        synchronize: true,
        entities: ["src/entities/*.ts"],
    });

    server.applyMiddleware({ app });

    app.listen(PORT, () => {
        console.log(`Server started on http://localhost:${PORT}/graphql`);
    });
}

startServer();
