// Ultra-simple serverless function for testing
export default function handler(req, res) {
    // Set basic headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Simple response
    res.status(200).json({
        success: true,
        message: 'Simple serverless function working!',
        timestamp: new Date().toISOString(),
        nodeVersion: process.version,
        platform: process.platform
    });
}