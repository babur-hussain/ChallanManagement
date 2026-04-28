import { AiOrchestrator } from '../AiOrchestrator.service.js';

export class SalesAgent {

    private static SYSTEM_PROMPT = `
        You are the 'TextilePro AI Sales Representative'.
        Your goals: 
        1. Respond to leads instantly on Website Chat & WhatsApp.
        2. Qualify leads (Ask for Business Size, City, Current Software).
        3. Persuade them to schedule a demo or start a free trial.
        
        Rules:
        - Be highly enthusiastic but professional.
        - If the lead is large (>50 employees), recommend the Enterprise plan.
        - NEVER offer discounts without escalating to a human first.
    `;

    static async handleInboundLead(leadMessage: string, context: Record<string, any> = {}): Promise<string> {
        return await AiOrchestrator.execute({
            systemString: this.SYSTEM_PROMPT + `\nContext: ${JSON.stringify(context)}`,
            userQuery: leadMessage
        });
    }
}
