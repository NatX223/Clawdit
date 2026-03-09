import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import createWalletRoutes from './routes/createWallet';

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

dotenv.config();

let CREDENTIALS;
try {
    const credBase64 = process.env.CRED;
    if (!credBase64) {
        throw new Error('CRED environment variable is not set');
    }

    CREDENTIALS = JSON.parse(
        Buffer.from(credBase64, 'base64').toString('utf-8')
    );
} catch (error) {
    console.error('❌ Failed to parse Firebase credentials:', error);
    process.exit(1);
}

admin.initializeApp({
    credential: admin.credential.cert(CREDENTIALS),
});

// Initialize Firestore
export const db = getFirestore();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3300;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Register routes
app.use('/', createWalletRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Basic route
app.get('/', (req, res) => {
    res.json({
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;