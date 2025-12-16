const admin = require('firebase-admin');

// Initialize Firebase Admin
if (!admin.apps.length) {
    try {
        const serviceAccount = require('../../vitalife-98ec1-firebase-adminsdk-fbsvc-e0c8481728.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase Admin initialized');
    } catch (error) {
        console.error('❌ Firebase Admin initialization failed:', error);
        console.error('Make sure serviceAccountKey.json exists in the root directory');
    }
}

const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
            });
        }

        const token = authHeader.split('Bearer ')[1];

        const decodedToken = await admin.auth().verifyIdToken(token);

        // CRITICAL: Verify admin email
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && decodedToken.email !== adminEmail) {
            console.warn(`⚠️ Unauthorized access attempt from: ${decodedToken.email}`);
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have admin privileges',
            });
        }

        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
        };

        next();
    } catch (error) {
        console.error('Token verification error:', error);
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or expired token',
        });
    }
};

module.exports = { verifyFirebaseToken };
