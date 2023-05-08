import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import { getRepository } from "typeorm";
import { Movie } from "./entities/Movie";
import { User } from "./entities/User";

const JWT_SECRET = process.env.JWT_SECRET || "";

export const resolvers = {
    Query: {
        movies: async (_, { skip = 0, take = 10, orderBy, filter }) => {
            const query = getRepository(Movie)
                .createQueryBuilder("movie")
                .skip(skip)
                .take(take);

            if (filter) {
                query.where(
                    "LOWER(movie.name) LIKE LOWER(:filter) OR LOWER(movie.description) LIKE LOWER(:filter)",
                    { filter: `%${filter}%` }
                );
            }

            if (orderBy) {
                const [column, order] = orderBy.split("_");
                query.orderBy(`movie.${column}`, order.toUpperCase());
            }

            return query.getMany();
        },
        movie: (_, { id }) => {
            return Movie.findOne(id);
        },
    },
    Mutation: {
        signUp: async (_, { username, email, password }) => {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                throw new UserInputError("Email already in use");
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                username,
                email,
                password: hashedPassword,
            }).save();

            return true;
        },
        login: async (_, { email, password }) => {
            const user = await User.findOne({ where: { email } });
            if (!user) {
                throw new UserInputError("Invalid email or password");
            }

            const passwordMatch = await bcrypt.compare(password, user.password);
            if (!passwordMatch) {
                throw new UserInputError("Invalid email or password");
            }

            const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
                expiresIn: "1h",
            });

            return token;
        },
        changePassword: async (_, { oldPassword, newPassword }, { req }) => {
            const userId = req.userId;
            const user = await User.findOne(userId);
            if (!user) {
                throw new AuthenticationError("Invalid token");
            }

            const passwordMatch = await bcrypt.compare(oldPassword, user.password);
            if (!passwordMatch) {
                throw new UserInputError("Invalid password");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return true;
        },
        createMovie: async (_, { name, description, director, releaseDate }, { req }) => {
            const userId = req.userId;
            const user = await User.findOne(userId);
            if (!user) {
                throw new AuthenticationError("Invalid token");
            }

            const movie = await Movie.create({
                name,
                description,
                director,
                releaseDate: new Date(releaseDate),
            }).save();
        }
    }