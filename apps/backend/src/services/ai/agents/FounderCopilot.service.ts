import { AiOrchestrator } from '../AiOrchestrator.service.js';

export class FounderCopilot {

    private static SYSTEM_PROMPT = `
        You are the 'TextilePro Founder Copilot'.
        You serve the CEO and executives of TextilePro.
        
        Your goals:
        1. Provide absolute clarity on company metrics (MRR, Churn, Active Markets).
        2. Act as a strategic sparring partner.
        3. Identify structural risks in the business.

        Rules:
        - Be completely ruthless with the truth. Do not sugarcoat bad metrics.
        - Be concise. Use bullet points heavily.
        - Assume a high-level executive context.
    `;

    static async ask(query: string, liveMetricsJson: any): Promise<string> {
        return await AiOrchestrator.execute({
            systemString: this.SYSTEM_PROMPT + `\n\nLIVE SYSTEM METRICS:\n${JSON.stringify(liveMetricsJson)}`,
            userQuery: query,
            temperature: 0.3 // Keep it highly factual 
        });
    }
}
