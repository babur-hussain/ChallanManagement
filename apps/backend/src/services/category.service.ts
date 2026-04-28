import { Category } from '../models/Category.js';
import { Errors } from '../middleware/errorHandler.js';

export class CategoryService {
    /**
     * Get categories with optional filtering, sorting and pagination
     */
    async getCategories(businessId: string, filters: {
        search?: string;
        isActive?: boolean;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
    }) {
        const {
            search, isActive,
            page = 1, limit = 50,
            sortBy = 'name', sortOrder = 'asc'
        } = filters;

        const query: any = { businessId };

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        const sortDir = sortOrder === 'desc' ? -1 : 1;
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            Category.find(query)
                .sort({ [sortBy]: sortDir })
                .skip(skip)
                .limit(limit)
                .lean(),
            Category.countDocuments(query)
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    /**
     * Create a new category
     */
    async createCategory(businessId: string, data: { name: string; description?: string; isActive?: boolean }) {
        // Check if category with same name exists
        const existing = await Category.findOne({
            businessId,
            name: { $regex: new RegExp(`^${data.name}$`, 'i') }
        });

        if (existing) {
            throw Errors.conflict('Category with this name already exists');
        }

        const category = new Category({
            businessId,
            ...data
        });

        await category.save();
        return category;
    }

    /**
     * Get category by ID
     */
    async getCategoryById(businessId: string, id: string) {
        const category = await Category.findOne({ _id: id, businessId }).lean();
        if (!category) throw Errors.notFound('Category');
        return category;
    }

    /**
     * Update category
     */
    async updateCategory(businessId: string, id: string, data: { name?: string; description?: string; isActive?: boolean }) {
        if (data.name) {
            const existing = await Category.findOne({
                businessId,
                name: { $regex: new RegExp(`^${data.name}$`, 'i') },
                _id: { $ne: id }
            });
            if (existing) {
                throw Errors.conflict('Category with this name already exists');
            }
        }

        const category = await Category.findOneAndUpdate(
            { _id: id, businessId },
            { $set: data },
            { new: true }
        );

        if (!category) throw Errors.notFound('Category');
        return category;
    }

    /**
     * Delete / Soft delete category
     */
    async deleteCategory(businessId: string, id: string) {
        const category = await Category.findOneAndDelete({ _id: id, businessId });
        if (!category) throw Errors.notFound('Category');
        return true;
    }
}

export const categoryService = new CategoryService();
