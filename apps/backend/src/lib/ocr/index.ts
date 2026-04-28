import { OCRProvider } from './OCRProvider.js';
import {
    GoogleVisionProvider, AWSTextractProvider, AzureOCRProvider,
    OpenRouterProvider, GeminiVisionProvider, ClaudeVisionProvider,
    TesseractProvider
} from './providers.js';

export class OCREngineFactory {
    private static providers: Map<string, OCRProvider> = new Map();

    static {
        this.register(new GoogleVisionProvider());
        this.register(new AWSTextractProvider());
        this.register(new AzureOCRProvider());
        this.register(new OpenRouterProvider());
        this.register(new GeminiVisionProvider());
        this.register(new ClaudeVisionProvider());
        this.register(new TesseractProvider());
    }

    static register(provider: OCRProvider) {
        this.providers.set(provider.getName(), provider);
    }

    static getProvider(name: string): OCRProvider {
        const provider = this.providers.get(name);
        if (!provider) {
            console.warn(`OCR Provider ${name} not found. Falling back to TESSERACT.`);
            return this.providers.get('TESSERACT')!;
        }
        return provider;
    }
}
