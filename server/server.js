import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoutes.js'
import imageRouter from './routes/imageRoutes.js'

const PORT = process.env.PORT || 4000;
const app = express();

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('- MongoDB URI:', process.env.MONGODB_URI ? 'Loaded' : 'Missing');
console.log('- JWT Secret:', process.env.JWT_SECRET ? 'Loaded' : 'Missing');
console.log('- ClipDrop API Key:', process.env.CLIPDROP_API_KEY ? 'Loaded' : 'Missing');
console.log('- Port:', PORT);

app.use(cors());
app.use(express.json());
await connectDB();


app.use('/api/user', userRouter);
app.use('/api/image', imageRouter);
app.get('/', (req, res) => {
    res.send('API Working');
});

app.listen(PORT, () => 
    console.log(`Server is running on port ${PORT}`)
);