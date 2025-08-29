import {registerUser, loginUser, userCredits, getUserProfile, paymentRazorpay, verifyRazorpay} from '../controllers/userController.js';   
import express from 'express';
import userAuth from '../middlewares/auth.js';

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);

// Protected routes
userRouter.get('/credits', userAuth, userCredits);
userRouter.get('/profile', userAuth, getUserProfile);
userRouter.post('/pay-razor', userAuth, paymentRazorpay);
userRouter.post('/verify-razor', verifyRazorpay);

export default userRouter;

