import { AuthenticationError, UserInputError } from "apollo-server-errors";
import Post from "../../models/Post.js";
import checkAuth from "../../util/checkAuth.js";
import pubsub from "../pubsub.js";

const postResolvers = {
    Query: {
        async getPosts() {
            try {
                const posts = await Post.find().sort({'createdAt': -1});
                return posts
            } catch (err) {
                throw new Error(err);
            }
        },
        async getPost(parent, { postId }) {
            try {
                const post = await Post.findById(postId);
                if (post) {
                    return post
                } else {
                    throw new Error('Post not found')
                }
            } catch (err) {
                throw new Error('Post not found')
            }
        }
    },
    Mutation: {
        async createPost(_, {body, image}, context) {
            const user = checkAuth(context);
            if (body.trim() == '') {
                throw new Error('Post body must not be empty')
            }
            const newPost = new Post({
                body,
                user: user.id,
                username: user.username,
                createdAt: new Date().toISOString(),
                image
            })

            const post = await newPost.save();
            
            context.pubsub.publish('NEW_POST', {
                newPost: post
            })
            return post;
        },
        async deletePost(_, { postId }, context) {
            const user = checkAuth(context);
            try {
                const post = await Post.findById(postId);
                if (post && user.username == post.username) {
                    try {
                        await Post.findByIdAndDelete(postId)
                    } catch {}
                    return 'Post deleted successfully'
                } else {
                    throw new AuthenticationError('Action not allowed')
                }
            } catch (err) {
                throw new Error(err);
            }
        },
        async likePost(_, {postId}, context) {
            const { username } = checkAuth(context);
            const post = await Post.findById(postId);

            if (post) {
                if (post.likes.find(like => like.username === username)) {
                    post.likes = post.likes.filter(like => like.username !== username);
                } else {
                    post.likes.push({
                        username,
                        createdAt: new Date().toISOString()
                    })
                }
                await post.save();
                return post;
            } else {
                throw new UserInputError('Post not found')
            }
        }
    },
    Subscription: {
        newPost: {
            subscribe: () => {
                return pubsub.asyncIterator('NEW_POST')
            }
        }
    }
};

export default postResolvers;