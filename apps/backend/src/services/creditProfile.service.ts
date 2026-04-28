import mongoose from 'mongoose';
import { PartyCreditProfile } from '../models/PartyCreditProfile.js';
import { PromiseToPay } from '../models/PromiseToPay.js';
import { Invoice } from '../models/Invoice.js';
import { Challan } from '../models/Challan.js';
import { logger } from '../lib/logger.js';

export class CreditProfileService {

    // ─── Get or Create Profile ────────────────────────────────

    static async getOrCreate(businessId: string, partyId: string) {
        let profile = await PartyCreditProfile.findOne({ businessId, partyId });
        if (!profile) {
            profile = await PartyCreditProfile.create({
                businessId,
                partyId,
                creditLimitAmount: 100000,
                creditDays: 30,
            });
        }
        return profile;
    }

    // ─── Update Credit Limits ─────────────────────────────────

    static async updateLimits(businessId: string, partyId: string, data: { creditLimitAmount?: number; creditDays?: number }) {
        const profile = await this.getOrCreate(businessId, partyId);
        if (data.creditLimitAmount !== undefined) profile.creditLimitAmount = data.creditLimitAmount;
        if (data.creditDays !== undefined) profile.creditDays = data.creditDays;
        await profile.save();
        return profile;
    }

    // ─── Recalculate Credit Score (AI Risk Engine) ────────────

    static async recalculateScore(businessId: string, partyId: string) {
        const profile = await this.getOrCreate(businessId, partyId);

        // Gather data from invoices
        const invoices = await Invoice.find({ businessId, partyId }).lean();
        const challans = await Challan.find({ businessId, partyId }).lean();

        // Compute metrics
        const totalSales = invoices.reduce((s: number, inv: any) => s + (inv.grandTotal || 0), 0)
            + challans.reduce((s: number, ch: any) => s + (ch.totalAmount || 0), 0);
        const totalPayments = invoices.reduce((s: number, inv: any) => s + (inv.amountPaid || 0), 0);
        const outstanding = totalSales - totalPayments;

        // Delay calculations from invoices
        const delays: number[] = [];
        for (const inv of invoices) {
            const i = inv as any;
            if (i.paymentStatus === 'PAID' && i.paidAt && i.dueDate) {
                const delay = Math.max(0, Math.floor((new Date(i.paidAt).getTime() - new Date(i.dueDate).getTime()) / 86400000));
                delays.push(delay);
            } else if (i.dueDate && new Date(i.dueDate) < new Date()) {
                const delay = Math.floor((Date.now() - new Date(i.dueDate).getTime()) / 86400000);
                delays.push(delay);
            }
        }

        const avgDelay = delays.length > 0 ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : 0;
        const maxDelay = delays.length > 0 ? Math.max(...delays) : 0;
        const onTime = delays.length > 0 ? Math.round((delays.filter(d => d <= 3).length / delays.length) * 100) : 100;

        // Broken promises
        const brokenPromises = await PromiseToPay.countDocuments({ businessId, partyId, status: 'BROKEN' });

        // Check inactivity (no challan/invoice in 90 days)
        const ninetyDaysAgo = new Date(Date.now() - 90 * 86400000);
        const recentActivity = await Challan.countDocuments({
            businessId, partyId, createdAt: { $gte: ninetyDaysAgo }
        });

        profile.totalLifetimeSales = totalSales;
        profile.totalLifetimePayments = totalPayments;
        profile.currentOutstanding = Math.max(0, outstanding);
        profile.highestOutstandingEver = Math.max(profile.highestOutstandingEver, outstanding);
        profile.avgDelayDays = avgDelay;
        profile.maxDelayDays = maxDelay;
        profile.onTimePaymentPercent = onTime;
        profile.bouncedPaymentsCount = brokenPromises; // proxy

        // Risk flags
        profile.chronicLatePayer = avgDelay > 15;
        profile.chequeBounceRisk = brokenPromises >= 2;
        profile.inactiveButOutstanding = (recentActivity === 0 && outstanding > 0);
        profile.overLimitNow = outstanding > profile.creditLimitAmount;
        profile.overdueNow = delays.some(d => d > 0);

        // ─── AI Credit Score (0-100) ────────────────────────────
        let score = 75; // base

        // On-time payment bonus
        if (onTime >= 90) score += 15;
        else if (onTime >= 70) score += 5;
        else if (onTime < 50) score -= 20;

        // Delay penalty
        if (avgDelay > 30) score -= 25;
        else if (avgDelay > 15) score -= 15;
        else if (avgDelay > 7) score -= 5;

        // Outstanding ratio penalty
        if (profile.creditLimitAmount > 0) {
            const ratio = outstanding / profile.creditLimitAmount;
            if (ratio > 1.5) score -= 20;
            else if (ratio > 1) score -= 10;
            else if (ratio > 0.8) score -= 5;
        }

        // Broken promises penalty
        if (brokenPromises >= 5) score -= 20;
        else if (brokenPromises >= 3) score -= 10;
        else if (brokenPromises >= 1) score -= 5;

        // Inactive but outstanding
        if (profile.inactiveButOutstanding) score -= 10;

        // Lifetime relationship bonus
        if (totalSales > 1000000) score += 5;

        score = Math.max(0, Math.min(100, score));

        // Grade
        let grade: string;
        let riskLevel: string;
        if (score >= 90) { grade = 'A+'; riskLevel = 'LOW'; }
        else if (score >= 75) { grade = 'A'; riskLevel = 'LOW'; }
        else if (score >= 60) { grade = 'B'; riskLevel = 'MEDIUM'; }
        else if (score >= 45) { grade = 'C'; riskLevel = 'MEDIUM'; }
        else if (score >= 30) { grade = 'D'; riskLevel = 'HIGH'; }
        else { grade = 'HIGH_RISK'; riskLevel = 'CRITICAL'; }

        // Recommendation
        let recommendation: string;
        if (score >= 85 && onTime >= 90 && !profile.overLimitNow) recommendation = 'INCREASE_LIMIT';
        else if (score >= 60) recommendation = 'MAINTAIN';
        else if (score >= 30) recommendation = 'REDUCE_LIMIT';
        else recommendation = 'BLOCK_NEW_DISPATCH';

        // AI Suggestions
        const suggestions: string[] = [];
        if (avgDelay > 15) suggestions.push('Call today — chronic late payer');
        if (profile.overLimitNow) suggestions.push('Stop dispatch — over credit limit');
        if (brokenPromises >= 2) suggestions.push('Take advance only — multiple broken promises');
        if (outstanding > 500000) suggestions.push('Visit physically — high outstanding');
        if (profile.inactiveButOutstanding) suggestions.push('Offer settlement — inactive but outstanding');
        if (avgDelay > 30) suggestions.push('Escalate to owner');
        if (score >= 85) suggestions.push('Reliable customer — can extend credit');

        profile.creditScore = score;
        profile.creditGrade = grade;
        profile.riskLevel = riskLevel;
        profile.recommendation = recommendation;
        profile.aiSuggestions = suggestions;

        await profile.save();
        return profile;
    }

    // ─── Credit Check (before challan/quotation) ──────────────

    static async checkCredit(businessId: string, partyId: string, newAmount: number = 0) {
        const profile = await this.getOrCreate(businessId, partyId);
        const warnings: Array<{ level: 'RED' | 'AMBER' | 'GREEN'; message: string }> = [];
        let requiresOverride = false;

        if (profile.isBlocked) {
            warnings.push({ level: 'RED', message: `Party is BLOCKED: ${profile.blockedReason || 'No reason specified'}` });
            requiresOverride = true;
        }

        const projectedOutstanding = profile.currentOutstanding + newAmount;
        if (projectedOutstanding > profile.creditLimitAmount) {
            warnings.push({
                level: 'RED',
                message: `Outstanding ₹${projectedOutstanding.toLocaleString()} exceeds limit ₹${profile.creditLimitAmount.toLocaleString()}`
            });
            requiresOverride = true;
        }

        if (profile.overdueNow && profile.maxDelayDays > 30) {
            warnings.push({
                level: 'RED',
                message: `Overdue by ${profile.maxDelayDays} days`
            });
        }

        if (profile.avgDelayDays > 15) {
            warnings.push({
                level: 'AMBER',
                message: `Average delay: ${profile.avgDelayDays} days`
            });
        }

        if (profile.bouncedPaymentsCount > 0) {
            warnings.push({
                level: 'AMBER',
                message: `${profile.bouncedPaymentsCount} broken promises recorded`
            });
        }

        if (warnings.length === 0) {
            warnings.push({ level: 'GREEN', message: 'Credit check passed' });
        }

        return {
            allowed: !requiresOverride,
            warnings,
            profile,
            requiresOverride,
        };
    }

    // ─── Block / Unblock ──────────────────────────────────────

    static async blockParty(businessId: string, partyId: string, userId: string, reason: string) {
        const profile = await this.getOrCreate(businessId, partyId);
        profile.isBlocked = true;
        profile.blockedAt = new Date();
        profile.blockedBy = new mongoose.Types.ObjectId(userId) as any;
        profile.blockedReason = reason;
        await profile.save();
        return profile;
    }

    static async unblockParty(businessId: string, partyId: string) {
        const profile = await this.getOrCreate(businessId, partyId);
        profile.isBlocked = false;
        profile.unblockedAt = new Date();
        profile.blockedReason = undefined;
        await profile.save();
        return profile;
    }

    // ─── List High Risk Parties ───────────────────────────────

    static async getHighRiskParties(businessId: string) {
        return PartyCreditProfile.find({
            businessId,
            riskLevel: { $in: ['HIGH', 'CRITICAL'] },
        })
            .sort({ currentOutstanding: -1 })
            .populate('partyId', 'name phone address')
            .lean();
    }

    // ─── All Profiles with Outstanding ────────────────────────

    static async getOutstandingParties(businessId: string, filters: any = {}) {
        const query: any = { businessId, currentOutstanding: { $gt: 0 } };
        if (filters.riskLevel) query.riskLevel = filters.riskLevel;
        if (filters.creditGrade) query.creditGrade = filters.creditGrade;
        if (filters.isBlocked !== undefined) query.isBlocked = filters.isBlocked === 'true';

        const profiles = await PartyCreditProfile.find(query)
            .sort({ currentOutstanding: -1 })
            .populate('partyId', 'name phone address')
            .lean();

        return profiles;
    }

    // ─── Bulk Recalculate ─────────────────────────────────────

    static async recalculateAll(businessId: string) {
        const profiles = await PartyCreditProfile.find({ businessId }).lean();
        let updated = 0;
        for (const p of profiles) {
            try {
                await this.recalculateScore(businessId, p.partyId.toString());
                updated++;
            } catch (err) {
                logger.warn(`Failed to recalculate score for party ${p.partyId}`, err);
            }
        }
        return { updated, total: profiles.length };
    }
}
