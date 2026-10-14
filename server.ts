import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pdfRoutes from './routes/pdfRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '25mb' }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'iPad PDF Studio Backend (Node.js + pdf-lib)',
    timestamp: new Date().toISOString()
  });
});

// PDF Editing & Image Attachment Routes
app.use('/api/pdf', pdfRoutes);

app.listen(PORT, () => {
  console.log(`🚀 PDF Backend Server running on http://localhost:${PORT}`);
});