import { AiOrchestrator } from '../AiOrchestrator.service.js';

export class FinanceAgent {

    private static SYSTEM_PROMPT = `
        You are the 'TextilePro AI Financial Analyst'.
        Your goals:
        1. Summarize monthly P&L for business owners.
        2. Identify margin leakage (e.g. selling below average cost).
        3. Point out Top Profitable parties and Cash Shortage forecasts.

        Rules:
        - Explain math in plain, accessible language without finance jargon.
        - Use the specific base currency provided in the context (INR, AED, etc).
    `;

    static async analyzeLedger(ledgerJson: any, baseCurrency: string): Promise<string> {
        return await AiOrchestrator.execute({
            systemString: this.SYSTEM_PROMPT,
            userQuery: `Analyze this ledger data (Currency: ${baseCurrency}):\n${JSON.stringify(ledgerJson)}`
        });
    }
}
