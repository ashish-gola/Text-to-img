import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import razorpay from "razorpay";
import transactionModel from "../models/transactionModel.js";

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation (min 6 chars, at least one letter and one number)
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/;

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false, 
                message: "All fields are required" 
            });
        }

        // Validate name length
        if (name.trim().length < 2) {
            return res.status(400).json({
                success: false, 
                message: "Name must be at least 2 characters long" 
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false, 
                message: "Please enter a valid email address" 
            });
        }

        // Validate password strength
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false, 
                message: "Password must be at least 6 characters long and contain at least one letter and one number" 
            });
        }

        // Check if user already exists
        const existingUser = await userModel.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false, 
                message: "User already exists with this email" 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user data
        const userData = {
            name: name.trim(),
            email: email.toLowerCase(),
            password: hashedPassword
        };

        // Save user
        const newUser = new userModel(userData);
        const user = await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                creditBalance: user.creditBalance
            }
        });

    } catch (error) {
        console.error("Error registering user:", error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ 
                success: false, 
                message: "User already exists with this email" 
            });
        }
        
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during registration" 
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false, 
                message: "Email and password are required" 
            });
        }

        // Validate email format
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false, 
                message: "Please enter a valid email address" 
            });
        }

        // Find user by email
        const user = await userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid email or password" 
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email }, 
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: { 
                id: user._id,
                name: user.name,
                email: user.email,
                creditBalance: user.creditBalance
            }
        });

    } catch (error) {
        console.error("Error logging in user:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error during login" 
        });
    }
}

const userCredits = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User ID not found in token" 
            });
        }

        const user = await userModel.findById(userId);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            success: true, 
            creditBalance: user.creditBalance, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
   
    } catch(error) {
        console.error("Error fetching user credits:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching user credits" 
        });
    }
}

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User ID not found in token" 
            });
        }

        const user = await userModel.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                creditBalance: user.creditBalance
            }
        });
   
    } catch(error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({ 
            success: false, 
            message: "Error fetching user profile" 
        });
    }
}

const razorpayInstance = new razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Log Razorpay configuration status
console.log('Razorpay Configuration:');
console.log('Key ID exists:', !!process.env.RAZORPAY_KEY_ID);
console.log('Key Secret exists:', !!process.env.RAZORPAY_KEY_SECRET);
console.log('Key ID starts with rzp_:', process.env.RAZORPAY_KEY_ID?.startsWith('rzp_'));

const paymentRazorpay = async (req, res) => {
    try {
        const { planId } = req.body;
        const userId = req.user?.userId;

        console.log('Payment request received:', { planId, userId });

        if (!userId || !planId) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        // Check if Razorpay is properly configured
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || 
            process.env.RAZORPAY_KEY_ID === 'rzp_test_your_key_id_here' ||
            process.env.RAZORPAY_KEY_SECRET === 'your_razorpay_key_secret_here') {
            console.error('Razorpay not properly configured');
            return res.status(500).json({ 
                success: false, 
                message: "Payment service not configured. Please contact administrator." 
            });
        }

        const userData = await userModel.findById(userId);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let credits, plan, amount, date;

        switch (planId) {
            case 'Basic':
                plan = 'Basic';
                credits = 100;
                amount = 10;
                break;
            case 'Advanced':
                plan = 'Advanced';
                credits = 500;
                amount = 50;
                break;
            case 'Business':
                plan = 'Business';
                credits = 5000;
                amount = 250;
                break;
            default:
                return res.status(400).json({ success: false, message: "Plan not found" });
        }

        date = Date.now();

        const transactionData = {
            userId,
            plan,
            credits,
            amount,
            date
        };

        const newTransaction = await transactionModel.create(transactionData);

        // Check if we're in demo mode (when proper Razorpay keys are not set)
        const isDemoMode = process.env.RAZORPAY_KEY_ID === 'rzp_test_1234567890' || 
                          process.env.RAZORPAY_KEY_SECRET === 'test_secret_1234567890';

        if (isDemoMode) {
            // Demo mode - simulate successful payment
            console.log('Running in demo mode - simulating payment');
            
            // Update user credits directly
            await userModel.findByIdAndUpdate(userId, {
                $inc: { creditBalance: credits }
            });

            // Mark transaction as completed
            await transactionModel.findByIdAndUpdate(newTransaction._id, {
                status: 'completed',
                paymentId: 'demo_payment_' + Date.now()
            });

            return res.status(200).json({ 
                success: true, 
                message: `${credits} credits added successfully!`,
                demoMode: true,
                creditsAdded: credits
            });
        }

        const options = {
            amount: amount * 100,
            currency: process.env.CURRENCY || 'INR',
            receipt: newTransaction._id,
        };

        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ success: true, order });


    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;

        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if(orderInfo.status === 'paid') {
            const transactionData = await transactionModel.findById(orderInfo.receipt);
            if(transactionData.payment) {
                return res.status(400).json({ success: false, message: "Payment Failed" });
            }

            const userData = await userModel.findById(transactionData.userId);

            const creditBalance = userData.creditBalance + transactionData.credits;
            await userModel.findByIdAndUpdate(userData._id, { creditBalance });

            await transactionModel.findByIdAndUpdate(transactionData._id, { payment: true });

            res.status(200).json({ success: true, message: "Credits Added Successfully"});
        } else {
            res.status(400).json({ success: false, message: "Credits not added" });
        }

    } catch (error) {
        console.error("Error verifying Razorpay payment:", error);
        res.status(500).json({ success: false, message: error.message });
    }
}

export { registerUser, loginUser, userCredits, getUserProfile, paymentRazorpay, verifyRazorpay };