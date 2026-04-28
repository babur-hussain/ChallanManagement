export interface OCRExtractionResult {
    rawText: string;
    confidence: number;
    metadata?: any;
}

export interface OCRProvider {
    getName(): string;
    extractText(filePathOrUrl: string, mimeType: string, options?: any): Promise<OCRExtractionResult>;
    extractTable?(filePathOrUrl: string, mimeType: string, options?: any): Promise<any>;
    extractKeyValue?(filePathOrUrl: string, mimeType: string, options?: any): Promise<any>;
}
