import User from "../../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserInputError } from "apollo-server-errors";
import { validateRegisterInput, validateLoginInput } from "../../util/validators.js";
import checkAuth from "../../util/checkAuth.js";

const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        
    }, process.env.SECRET_KEY, {expiresIn: '1h'})
}

const userResolvers = {
    Query: {
        async verifyUser(parent, args, context) {
            try {
                const user = checkAuth(context);
                return await User.findById(user.id);
            } catch(err) {
                return null;
            }
        }
    },
    Mutation: {
        async register(parent, args) {
            let {username, email, password, confirmPassword} = args['registerInput'];
            const { valid, errors} = validateRegisterInput(username, email, password, confirmPassword);
            if (!valid) {
                throw new UserInputError('Errors', {errors});
            }
            const user = await User.findOne({ username });
            
            if (user) {
                throw new UserInputError('Username is taken', {
                    errors: {
                        username: 'This username is taken'
                    }
                })
            }
            password = await bcrypt.hash(password, 12);

            const newUser = new User({
                email,
                username,
                password,
                createdAt: new Date().toISOString()
            })

            const res = await newUser.save();

            const token = jwt.sign({
                id: res.id,
                email: res.email,
                username: res.username,
                
            }, process.env.SECRET_KEY, {expiresIn: '1h'})

            return {
                user:{
                    ...res._doc,
                    id: res._id,
                },
                token
            }
        },
        async login(parent, {username, password}) {
            const { errors, valid } = validateLoginInput(username, password);
            if (!valid) {
                throw new UserInputError('Errors', {errors});
            }
            const user = await User.findOne({username})
            if (!user) {
                errors.general = 'User not found';
                throw new UserInputError('User not found', {errors});
            }

            const match = await bcrypt.compare(password, user.password);
            if (!match) {
                errors.general = 'Wrong credentials';
                throw new UserInputError('Wrong credentials', {errors});
            }

            const token = generateToken(user)
            
            return {
                user: {
                    ...user._doc,
                    id: user._id,
                },
                token
            }
        }    
    },
};

export default userResolvers;