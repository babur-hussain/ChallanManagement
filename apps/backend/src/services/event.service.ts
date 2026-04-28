import { PlatformEvent, IPlatformEventDoc } from '../models/PlatformEvent.js';

export class EventTrackingService {
    /**
     * Publishes an event to the Data Warehouse stream.
     * In a large scale SaaS, this might push directly to an AWS Kinesis or Kafka queue.
     * For TextilePro this writes directly to MongoDB `PlatformEvents`
     */
    static async track(
        businessId: string,
        eventType: IPlatformEventDoc['eventType'],
        metadata: Record<string, any> = {},
        userId?: string
    ) {
        // High volume ingestion - non-blocking preferred in JS
        PlatformEvent.create({
            businessId,
            userId,
            eventType,
            metadata
        }).catch(err => {
            console.error('Failed to log platform event', err);
        });
    }
}
