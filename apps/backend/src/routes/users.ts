import { Router } from 'express';
import { handleRequest } from '../lib/api.js';
import { authenticate } from '../middleware/auth.js';
import { tenantIsolation } from '../middleware/tenantIsolation.js';
import { User } from '../models/User.js';

export const userRoutes = Router();

userRoutes.use(authenticate);
userRoutes.use(tenantIsolation);

// Get all users for the current business
userRoutes.get('/', handleRequest(async (req) => {
    return await User.find({ businessId: req.businessId }).select('-firebaseUid').sort('-createdAt');
}));

// Invite/Add a new user
userRoutes.post('/', handleRequest(async (req) => {
    const { name, email, mobile, role } = req.body;

    // In a real production system with firebase, this would also create a Firebase Auth user
    // For now, we simulate this by creating a mock firebaseUid for the demonstration or using an existing one.
    // If Firebase Auth is setup via client side first, then we only create DB record here. Let's assume Firebase Auth creates the user and then calls this, or we create it here with a random UUID.

    const user = new User({
        businessId: req.businessId,
        firebaseUid: req.body.firebaseUid || `usr-${Date.now()}`,
        name,
        email,
        mobile,
        role,
        isActive: true
    });
    await user.save();
    return user;
}));

// Update a user (e.g., change roles or deactivate)
userRoutes.put('/:id', handleRequest(async (req) => {
    const { id } = req.params;
    const { role, isActive, name, mobile } = req.body;

    const user = await User.findOneAndUpdate(
        { _id: id, businessId: req.businessId },
        { $set: { role, isActive, name, mobile } },
        { new: true }
    );

    if (!user) throw new Error('User not found');
    return user;
}));

// Delete a user
userRoutes.delete('/:id', handleRequest(async (req) => {
    const { id } = req.params;
    const user = await User.findOneAndDelete({ _id: id, businessId: req.businessId });
    if (!user) throw new Error('User not found');
    return { id };
}));

export default userRoutes;
