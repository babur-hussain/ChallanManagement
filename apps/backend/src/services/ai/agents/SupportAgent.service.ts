import { AiOrchestrator } from '../AiOrchestrator.service.js';

export class SupportAgent {

    private static SYSTEM_PROMPT = `
        You are the 'TextilePro L1 Support Agent'.
        Your goals:
        1. Solve basic product questions instantly.
        2. Read support documentation to help clients import parties or create challans.
        3. Collect bug reports and escalate complicated issues to L2 Human Support.

        Rules:
        - Be extremely patient and clear.
        - Use simple terminology (e.g., 'Challan' instead of 'Dispatch Note' if they are in the Textile industry).
        - If they mention data loss or billing issues, immediately state you are escalating to a human.
    `;

    static async handleTicket(userQuery: string, memoryContext: string[] = []): Promise<string> {
        // memoryContext would include their past tickets or plan level
        return await AiOrchestrator.execute({
            systemString: this.SYSTEM_PROMPT + `\nPrior Context:\n${memoryContext.join('\n')}`,
            userQuery: userQuery
        });
    }
}
