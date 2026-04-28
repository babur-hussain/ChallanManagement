import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { Partner } from '../models/Partner.js';
import { Subscription } from '../models/Subscription.js';
import { WhiteLabelTenant } from '../models/WhiteLabelTenant.js';

export const partnerRouter = Router();

partnerRouter.use(authenticate);

// Find the partner profile for the currently logged in User
const getPartner = async (userId: string) => {
    const partner = await Partner.findOne({ userId });
    if (!partner) throw new Error('Not registered as a partner');
    return partner;
}

partnerRouter.get('/profile', handleRequest(async (req) => {
    return await getPartner(req.user?._id as string);
}));

partnerRouter.get('/clients', handleRequest(async (req) => {
    const partner = await getPartner(req.user?._id as string);
    // In real app, clients would have a reference to the partnerCode
    return await Subscription.find(); // Mock return all
}));

partnerRouter.get('/white-label', handleRequest(async (req) => {
    const partner = await getPartner(req.user?._id as string);
    return await WhiteLabelTenant.findOne({ partnerId: partner._id });
}));

partnerRouter.post('/white-label', handleRequest(async (req) => {
    const partner = await getPartner(req.user?._id as string);
    let config = await WhiteLabelTenant.findOne({ partnerId: partner._id });
    if (!config) {
        config = new WhiteLabelTenant({ partnerId: partner._id, ...req.body });
    } else {
        Object.assign(config, req.body);
    }
    await config.save();
    return config;
}));
