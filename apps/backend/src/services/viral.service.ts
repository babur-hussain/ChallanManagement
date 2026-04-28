import { Business } from '../models/Business.js';
import { AppError } from '../lib/errors.js';

export class ViralService {

    /**
     * Issues an invite via WhatsApp text / Email.
     * When another entity signs up using the inviterId, both trigger rewards.
     */
    static async triggerInvite(invitingBusinessId: string, targetPhone: string) {
        // Stub: Fire a WHATSAPP request
        console.log(`Sending Viral Invite to ${targetPhone} from B_ID: ${invitingBusinessId}`);
    }

    /**
     * Awards Growth credits when a referral finishes Onboarding.
     */
    static async awardReferral(referringBusinessId: string, newBusinessId: string) {
        // E.g. Add 500 WhatsApp credits to the referrers account
        console.log(`[VIRAL LOOP] Awarding 500 WA Credits to ${referringBusinessId} for referring ${newBusinessId}`);
        return true;
    }
}
