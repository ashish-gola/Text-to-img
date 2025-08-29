import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        console.log('=== AUTH MIDDLEWARE DEBUG ===');
        console.log('Headers received:', JSON.stringify(req.headers, null, 2));
        
        // Check for token in multiple possible locations
        let token = req.headers.token || req.headers.authorization;
        
        console.log('Token found:', token ? 'YES' : 'NO');
        console.log('Token value:', token);
        
        // If authorization header starts with "Bearer ", extract the token
        if (token && token.startsWith('Bearer ')) {
            token = token.substring(7);
            console.log('Extracted Bearer token:', token);
        }
        
        if (!token) {
            console.log('❌ No token provided');
            return res.status(401).json({ 
                success: false, 
                message: "Not Authorized. Please login again." 
            });
        }

        console.log('🔐 Verifying token with JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
        
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded successfully:', decoded);
        
        // Set user information in request object
        req.user = { 
            userId: decoded.id || decoded.userId,
            email: decoded.email,
            name: decoded.name 
        };
        
        console.log('✅ User set in request:', req.user);
        console.log('=== AUTH MIDDLEWARE COMPLETE ===');
        
        next();
        
    } catch (error) {
        console.error("❌ Auth middleware error:", error.message);
        console.error("Error name:", error.name);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        } else if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token. Please login again." 
            });
        } else {
            return res.status(500).json({ 
                success: false, 
                message: "Authentication error. Please try again." 
            });
        }
    }
}

export default userAuth;
