// Simple serverless function test
export default function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Simple response
    res.status(200).json({
        success: true,
        message: 'Hello from Vercel serverless function!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        headers: req.headers
    });
}