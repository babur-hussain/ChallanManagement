import { ApiKey } from '../models/ApiKey.js';
import crypto from 'crypto';

export class DeveloperService {

    /**
     * Generates a new API key.
     * The raw key is returned ONLY ONCE. The server only stores the hashed version.
     */
    static async generateKey(businessId: string, name: string, scopes: string[]) {
        // Generate random bytes: 32 bytes = 64 hex characters
        const rawToken = crypto.randomBytes(32).toString('hex');
        const prefix = `txt_live_${rawToken.substring(0, 8)}`;
        const fullKey = `${prefix}_${rawToken}`;

        // Hash it for DB storage
        const hashedKey = crypto.createHash('sha256').update(fullKey).digest('hex');

        const newKey = new ApiKey({
            businessId,
            name,
            scopes,
            prefix,
            hashedKey, // Saved securely
            isActive: true
        });

        await newKey.save();

        return {
            id: newKey._id,
            name: newKey.name,
            prefix: newKey.prefix,
            scopes: newKey.scopes,
            // CRITICAL: Deliver the full key to the user only this ONE time.
            keyString: fullKey
        };
    }

    /**
     * Validates an inbound API key string against the database hash.
     */
    static async validateKey(keyString: string): Promise<any | null> {
        if (!keyString || !keyString.startsWith('txt_live_')) return null;

        const hashedSubject = crypto.createHash('sha256').update(keyString).digest('hex');

        // Find the key by searching the hash
        const apiKeyDoc = await ApiKey.findOne({ hashedKey: hashedSubject, isActive: true }).select('+hashedKey');

        if (!apiKeyDoc) return null;

        // Update lastUsedAt
        apiKeyDoc.lastUsedAt = new Date();
        await apiKeyDoc.save();

        return apiKeyDoc;
    }
}
