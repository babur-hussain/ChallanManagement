// @ts-ignore
import fetch from 'node-fetch';

export interface PromptPayload {
    systemString: string;
    userQuery: string;
    temperature?: number;
}

export class AiOrchestrator {
    // We use OpenRouter as our centralized gateway to query Gemma, Claude, or LLaMA
    private static OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

    // Force disable mocks to always use live generation
    private static get useMocks() {
        return false;
    }

    /**
     * Executes an LLM completion via OpenRouter.
     */
    static async execute(payload: PromptPayload, model: string = 'google/gemma-4-31b-it:free'): Promise<string> {

        if (this.useMocks) {
            console.log(`[AI ORCHESTRATOR MOCK] Routing to ${model}...`);
            return this.generateMockResponse(payload.systemString);
        }

        const modelsToTry = [model, 'nvidia/nemotron-3-super-120b-a12b:free', 'minimax/minimax-m2.5:free'];
        const MAX_ROUNDS = 5;

        for (let round = 1; round <= MAX_ROUNDS; round++) {
            if (round > 1) {
                console.log(`[AI ORCHESTRATOR] Round ${round}/${MAX_ROUNDS} — retrying all models...`);
                await new Promise(res => setTimeout(res, 1000)); // brief pause before re-trying
            }

            for (let i = 0; i < modelsToTry.length; i++) {
                const currentModel = modelsToTry[i];
                if (i > 0) {
                    console.log(`[AI ORCHESTRATOR] Falling back to ${currentModel} (round ${round})...`);
                }

                try {
                    const response = await fetch(`${this.OPENROUTER_BASE_URL}/chat/completions`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            model: currentModel,
                            messages: [
                                { role: 'system', content: payload.systemString },
                                { role: 'user', content: payload.userQuery }
                            ],
                            temperature: payload.temperature || 0.7
                        })
                    });

                    const data = await response.json();
                    if (data.choices && data.choices.length > 0) {
                        if (i > 0 || round > 1) console.log(`[AI ORCHESTRATOR] Success with ${currentModel} on round ${round}.`);
                        return data.choices[0].message.content;
                    }

                    // Log bad response and try next model
                    console.error(`[AI ORCHESTRATOR] ${currentModel} returned no choices (status ${response.status}):`, JSON.stringify(data));

                } catch (err) {
                    console.error(`[AI ORCHESTRATOR] ${currentModel} threw an error:`, err);
                }
            }
        }

        throw new Error(`All models failed after ${MAX_ROUNDS} rounds`);
    }

    private static generateMockResponse(systemString: string): string {
        if (systemString.includes('SALES')) {
            return "Hi there! I see you are based in Surat. TextilePro's basic plan starts at just ₹499/mo. Would you like to schedule a demo?";
        }
        if (systemString.includes('FOUNDER')) {
            return "Based on your metrics: Revenue is up 12% in Dubai this week. You have 3 at-risk customers in the Garment Mfg sector. I suggest reaching out immediately.";
        }
        return "I am the TextilePro AI operating in Mock mode. I have successfully processed your request.";
    }
}
