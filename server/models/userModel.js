import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    password: {
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    creditBalance: {
        type: Number, 
        default: 5,
        min: [0, 'Credit balance cannot be negative']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt fields
});

// Virtual to get user's total transactions (if needed)
userSchema.virtual('totalTransactions', {
    ref: 'Transaction',
    localField: '_id',
    foreignField: 'userId',
    count: true
});

// Method to update last login
userSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;