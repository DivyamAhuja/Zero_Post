import { gql } from 'apollo-server-express';


const typeDefs = gql`
    type Post{
        id: ID!
        body: String!
        createdAt: String!
        username: String!
        comments: [Comment]!
        commentCount: Int!
        likes: [Like]!
        likeCount: Int!
        image: String
        user: User!
    }
    type Comment {
        id: ID!
        createdAt: String!
        username: String!
        body: String!
        user: User!
    }
    type Like {
        id: ID!
        createdAt: String!
        username: String!
        user: User!
    }
    type User {
        id: ID!,
        email: String!
        username: String!
        createdAt: String!
        displayName: String
        profilePicture: String
    }
    input RegisterInput {
        username: String!,
        password: String!,
        confirmPassword: String!,
        email: String!
    }
    type Query {
        getPosts: [Post]
        getPost(postId: ID!): Post
        verifyUser: User
    }
    type LoginResponse {
        user: User
        token: ID
    }
    type Mutation {
        register(registerInput: RegisterInput!): LoginResponse!
        login(username: String!, password: String!): LoginResponse!
        createPost(body: String!, image: String): Post!
        deletePost(postId: ID!): String!
        createComment(postId: String!, body: String!): Post!
        deleteComment(postId: ID!, commentId: ID!): Post!
        likePost(postId: ID!): Post!
    }
    type Subscription {
        newPost: Post!
    }
`;

export default typeDefs;