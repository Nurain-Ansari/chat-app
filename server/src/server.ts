import app from './app';
import { connectToMongo } from './config/db';

const PORT = process.env.PORT || 5000;

connectToMongo().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
