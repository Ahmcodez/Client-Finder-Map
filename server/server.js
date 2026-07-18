import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './config/db.js';

dotenv.config();

const port = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error('Server failed to start:', error.message);
  process.exit(1);
});
