const app = require('./app');
const { config } = require('./config');

const port = config.port;

app.listen(port, () => {
    console.log('🚀 Club Vitalife Backend API');
    console.log(`📡 Server running on port ${port}`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
    console.log(`🔗 Health check: http://localhost:${port}/health`);
    console.log(`📦 Products API: http://localhost:${port}/api/products`);
    console.log('');
    console.log('✨ Ready to accept requests!');
});
