export async function generateSequenceNumber(businessId: string, prefix: string, entity: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const randomCounter = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}-${currentYear}-${randomCounter}`;
}
