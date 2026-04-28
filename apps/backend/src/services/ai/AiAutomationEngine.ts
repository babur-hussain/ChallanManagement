import { SalesAgent } from './agents/SalesAgent.service.js';

export class AiAutomationEngine {

    /**
     * Listens for internal system events. This replaces cron jobs with a reactive architecture.
     */
    static async handleEvent(eventName: string, payload: any) {

        console.log(`[AI AUTOMATION ENGINE] Received Event: ${eventName}`);

        switch (eventName) {
            case 'LEAD_INACTIVE_24H':
                await this.reviveOldLead(payload.leadId, payload.context);
                break;

            case 'TRIAL_ACTIVED_NO_CHALLAN_48H':
                await this.nudgeOnboarding(payload.businessId, payload.userName);
                break;

            case 'OVERDUE_INVOICES_SPIKE':
                await this.suggestCollections(payload.businessId);
                break;

            case 'CHURN_RISK_ELEVATED':
                await this.triggerRetention(payload.businessId);
                break;

            default:
                console.log(`[AI AUTOMATION ENGINE] No AI rules registered for ${eventName}`);
        }
    }

    private static async reviveOldLead(leadId: string, context: any) {
        const aiMessage = await SalesAgent.handleInboundLead(
            "It has been 24 hours since we last spoke. Can you check in with them warmly and ask if they have any doubts about pricing?",
            context
        );
        // Dispatch to WhatsApp or Email service here...
        console.log(`[AI ACTION] Sent to Lead ${leadId}: ${aiMessage}`);
    }

    private static async nudgeOnboarding(businessId: string, userName: string) {
        // Here we'd use an OnboardingAgent, but we'll simulate the orchestrator call
        const prompt = `Hey ${userName}, I noticed you signed up but haven't created your first Challan yet! Do you need help importing your stock?`;
        console.log(`[AI ACTION] Sent Nudge to ${businessId}: ${prompt}`);
    }

    private static async suggestCollections(businessId: string) {
        console.log(`[AI ACTION] Generating collections email drafts for overdue parties in ${businessId}`);
    }

    private static async triggerRetention(businessId: string) {
        console.log(`[AI ACTION] Alerting SuperAdmin and drafting a Custom Discount Offer for ${businessId}`);
    }
}
