import { OCRProvider, OCRExtractionResult } from './OCRProvider.js';

export class BaseOCRProvider implements OCRProvider {
    protected name: string;

    constructor(name: string) {
        this.name = name;
    }

    getName(): string {
        return this.name;
    }

    async extractText(filePathOrUrl: string, mimeType: string, options?: any): Promise<OCRExtractionResult> {
        // Default mock implementation
        const isPdf = mimeType.includes('pdf');
        return {
            rawText: `[Mock OCR by ${this.name}] Extracted from ${isPdf ? 'PDF' : 'Image'} at ${filePathOrUrl}`,
            confidence: 85,
            metadata: { provider: this.name, simulated: true }
        };
    }
}

// Concrete Mock Providers
export class GoogleVisionProvider extends BaseOCRProvider { constructor() { super('GOOGLE_VISION'); } }
export class AWSTextractProvider extends BaseOCRProvider { constructor() { super('AWS_TEXTRACT'); } }
export class AzureOCRProvider extends BaseOCRProvider { constructor() { super('AZURE_OCR'); } }
export class OpenRouterProvider extends BaseOCRProvider { constructor() { super('OPENROUTER'); } }
export class GeminiVisionProvider extends BaseOCRProvider { constructor() { super('GEMINI_VISION'); } }
export class ClaudeVisionProvider extends BaseOCRProvider {
    constructor() { super('CLAUDE_VISION'); }

    async extractText(filePathOrUrl: string, mimeType: string, options?: any): Promise<OCRExtractionResult> {
        // In a real implementation, this would use the @anthropic-ai/sdk
        // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
        // const response = await anthropic.messages.create({
        //     model: 'claude-opus-4.7',
        //     max_tokens: 1024,
        //     messages: [
        //         {
        //             role: 'user',
        //             content: [
        //                 { type: 'image', source: { type: 'base64', media_type: mimeType, data: '...' } },
        //                 { type: 'text', text: 'Extract all text and structured data from this document.' }
        //             ]
        //         }
        //     ]
        // });

        return {
            rawText: `[Mock OCR by Claude Opus 4.7] Successfully analyzed image at ${filePathOrUrl} using model claude-opus-4.7.`,
            confidence: 96,
            metadata: { provider: this.name, model: 'claude-opus-4.7', simulated: true }
        };
    }
}
export class TesseractProvider extends BaseOCRProvider { constructor() { super('TESSERACT'); } }
