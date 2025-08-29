import mongoose from "mongoose";

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => {
            console.log('MongoDB connected successfully');
        });

        mongoose.connection.on('error', (err) => {
            console.log('MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        await mongoose.connect(process.env.MONGODB_URI);
        
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        console.log('Please check your MongoDB URI and credentials in .env file');
        process.exit(1);
    }
}

export default connectDB;