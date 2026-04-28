import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { apiPost } from '../lib/api';
import type { IChallan } from '@textilepro/shared';

const QUEUE_KEY = '@TextilePro_WriteQueue';

interface QueueJob {
  type: 'CREATE_CHALLAN' | 'UPDATE_CHALLAN' | 'MARK_DELIVERED' | 'CREATE_INVOICE';
  payload: any;
  retries: number;
  createdAt: string;
}

export class OfflineSyncService {
  private static syncInProgress = false;

  /**
   * Queue a challan creation for offline-first submission
   */
  static async enqueueChallanCreation(challanData: Partial<IChallan>) {
    const challanDoc = {
      ...challanData,
      _localId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: 'DRAFT',
    };

    await this.enqueueJob({
      type: 'CREATE_CHALLAN',
      payload: challanDoc,
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    return challanDoc;
  }

  /**
   * Queue an invoice creation for offline-first submission
   */
  static async enqueueInvoiceCreation(invoiceData: any) {
    const invoiceDoc = {
      ...invoiceData,
      _localId: `offline_inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      status: invoiceData.isDraft ? 'DRAFT' : 'ACTIVE',
    };

    await this.enqueueJob({
      type: 'CREATE_INVOICE',
      payload: invoiceDoc,
      retries: 0,
      createdAt: new Date().toISOString(),
    });

    return invoiceDoc;
  }

  /**
   * Queue any job type
   */
  static async enqueueJob(job: QueueJob) {
    const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
    const queue: QueueJob[] = currentQueueStr ? JSON.parse(currentQueueStr) : [];
    queue.push(job);
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));

    // Attempt immediate sync
    this.syncNow();
  }

  /**
   * Get pending queue count
   */
  static async getPendingCount(): Promise<number> {
    const queueStr = await AsyncStorage.getItem(QUEUE_KEY);
    if (!queueStr) return 0;
    return JSON.parse(queueStr).length;
  }

  /**
   * Process all queued jobs when online
   */
  static async syncNow(): Promise<boolean> {
    if (this.syncInProgress) return false;

    const state = await NetInfo.fetch();
    if (!state.isConnected) return false;

    this.syncInProgress = true;

    try {
      const currentQueueStr = await AsyncStorage.getItem(QUEUE_KEY);
      if (!currentQueueStr) return true;

      const queue: QueueJob[] = JSON.parse(currentQueueStr);
      if (queue.length === 0) return true;

      const remainingQueue: QueueJob[] = [];

      for (const job of queue) {
        try {
          switch (job.type) {
            case 'CREATE_CHALLAN': {
              const payload = { ...job.payload };
              delete payload._localId;
              await apiPost('/challans', payload);
              break;
            }
            case 'CREATE_INVOICE': {
              const payload = { ...job.payload };
              delete payload._localId;
              await apiPost('/invoices', payload);
              break;
            }
            case 'UPDATE_CHALLAN': {
              const { id, ...data } = job.payload;
              await apiPost(`/challans/${id}`, data);
              break;
            }
            case 'MARK_DELIVERED': {
              await apiPost(`/challans/${job.payload.id}/mark-delivered`, {
                deliveryLatLng: job.payload.deliveryLatLng,
              });
              break;
            }
          }
        } catch (err) {
          // Retry up to 3 times
          if (job.retries < 3) {
            remainingQueue.push({ ...job, retries: job.retries + 1 });
          }
          // Drop after 3 retries
        }
      }

      await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remainingQueue));
      return remainingQueue.length === 0;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Register a NetInfo listener to auto-sync when connectivity returns
   */
  static startBackgroundSync() {
    return NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        this.syncNow();
      }
    });
  }
}
