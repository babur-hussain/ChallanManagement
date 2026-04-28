import { logger } from '../lib/logger.js';

export class ImageUtil {

    /**
     * Enhance image for OCR (simulated)
     * In production, this would use sharp or jimp to:
     * - Convert to grayscale
     * - Increase contrast
     * - Auto-crop edges
     * - Deskew
     */
    static async enhanceForOCR(buffer: Buffer): Promise<Buffer> {
        logger.info('Enhancing image for OCR (Simulated)...');
        // Simulated: return the buffer untouched for now.
        // Requires 'sharp' library in production:
        // return sharp(buffer).greyscale().normalize().png().toBuffer();
        return buffer;
    }

    /**
     * Generate thumbnail for UI fast loading
     */
    static async generateThumbnail(buffer: Buffer): Promise<Buffer> {
        logger.info('Generating image thumbnail (Simulated)...');
        return buffer;
    }
}
