import { gql } from "apollo-server-express";

export const typeDefs = gql`
  type Query {
    movies(skip: Int, take: Int, orderBy: String, filter: String): [Movie!]!
    movie(id: ID!): Movie
  }

  type Mutation {
    signUp(email: String!, username: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    changePassword(token: String!, oldPassword: String!, newPassword: String!): User!
    createMovie(name: String!, description: String!, director: String!, releaseDate: String!): Movie!
    updateMovie(id: ID!, name: String, description: String, director: String, releaseDate: String): Movie!
    deleteMovie(id: ID!): Boolean!
  }

  type Movie {
    id: ID!
    name: String!
    description: String!
    director: String!
    releaseDate: String!
  }
  
  type User {
    id: ID!
    email: String!
    username: String!
    password: String!
  }
  
  type AuthPayload {
    token: String!
    user: User!
  }`;
