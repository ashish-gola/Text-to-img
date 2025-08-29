import userModel from "../models/userModel.js";
import FormData from "form-data";
import axios from "axios";

export const generateImage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user?.userId;

        console.log("Generate image request:", { prompt, userId });

        // Validate inputs
        if (!prompt) {
            return res.status(400).json({ 
                success: false, 
                message: "Prompt is required" 
            });
        }

        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User authentication required" 
            });
        }

        // Check ClipDrop API key
        if (!process.env.CLIPDROP_API_KEY) {
            console.error("ClipDrop API key not configured");
            return res.status(500).json({ 
                success: false, 
                message: "Image generation service not configured" 
            });
        }

        console.log("ClipDrop API key loaded:", process.env.CLIPDROP_API_KEY ? "Yes" : "No");
        console.log("API key length:", process.env.CLIPDROP_API_KEY?.length || 0);

        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        if (user.creditBalance === 0 || user.creditBalance < 0) {
            return res.status(403).json({ 
                success: false, 
                message: "Insufficient credits", 
                creditBalance: user.creditBalance 
            });
        }

        console.log("Calling ClipDrop API with prompt:", prompt);

        const formData = new FormData();
        formData.append('prompt', prompt);

        const { data } = await axios.post('https://clipdrop-api.co/text-to-image/v1', formData, {
            headers: {
                'x-api-key': process.env.CLIPDROP_API_KEY,
                ...formData.getHeaders()
            },
            responseType: 'arraybuffer',
        });

        const base64Image = Buffer.from(data, 'binary').toString('base64');
        const resultImage = `data:image/png;base64,${base64Image}`;

        // Update user credits
        await userModel.findByIdAndUpdate(user._id, { 
            creditBalance: user.creditBalance - 1 
        });

        console.log("Image generated successfully for user:", userId);

        res.status(200).json({ 
            success: true, 
            creditBalance: user.creditBalance - 1, 
            resultImage 
        });

    } catch (error) {
        console.error("Error generating image:", error);
        
        // More specific error handling
        if (error.response?.status === 401) {
            return res.status(500).json({ 
                success: false, 
                message: "Invalid API key for image generation service" 
            });
        } else if (error.response?.status === 429) {
            return res.status(500).json({ 
                success: false, 
                message: "Too many requests. Please try again later." 
            });
        } else if (error.code === 'ENOTFOUND') {
            return res.status(500).json({ 
                success: false, 
                message: "Unable to connect to image generation service" 
            });
        }

        res.status(500).json({ 
            success: false, 
            message: "Failed to generate image. Please try again." 
        });
    }
}
export default generateImage;