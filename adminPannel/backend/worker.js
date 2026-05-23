import { httpServerHandler } from 'cloudflare:node';
import app from './server.js';

// Register the app to start listening on port 8080 internally
app.listen(8080);

// Export the httpServerHandler to bridge standard fetch requests to the Express app
export default httpServerHandler({ port: 8080 });
