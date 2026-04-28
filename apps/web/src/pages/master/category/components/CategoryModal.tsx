import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useCreateCategory, useUpdateCategory } from '@/hooks/api/useCategories';
import { createCategorySchema, CreateCategoryInput } from '@textilepro/shared';
import { toast } from 'sonner';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryToEdit?: any | null;
}

export function CategoryModal({ isOpen, onClose, categoryToEdit }: CategoryModalProps) {
    const createMutation = useCreateCategory();
    const updateMutation = useUpdateCategory();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<CreateCategoryInput>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: '',
            description: '',
            isActive: true,
        },
    });

    const isActive = watch('isActive');

    useEffect(() => {
        if (isOpen) {
            if (categoryToEdit) {
                reset({
                    name: categoryToEdit.name,
                    description: categoryToEdit.description || '',
                    isActive: categoryToEdit.isActive,
                });
            } else {
                reset({
                    name: '',
                    description: '',
                    isActive: true,
                });
            }
        }
    }, [isOpen, categoryToEdit, reset]);

    const onSubmit = async (data: CreateCategoryInput) => {
        try {
            if (categoryToEdit) {
                await updateMutation.mutateAsync({
                    id: categoryToEdit._id,
                    data,
                });
                toast.success(`Category "${data.name}" updated`);
            } else {
                await createMutation.mutateAsync(data);
                toast.success(`Category "${data.name}" created`);
            }
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Something went wrong');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <DialogHeader>
                        <DialogTitle>{categoryToEdit ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">
                                Category Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                placeholder="e.g. Georgette"
                                {...register('name')}
                                autoFocus
                            />
                            {errors.name && <span className="text-xs text-destructive">{errors.name.message}</span>}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Optional description..."
                                className="resize-none"
                                {...register('description')}
                            />
                            {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
                        </div>

                        <div className="flex items-center justify-between mt-2">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <p className="text-sm text-muted-foreground">
                                    Inactive categories won't appear in dropdowns
                                </p>
                            </div>
                            <Switch
                                checked={isActive}
                                onCheckedChange={(checked) => setValue('isActive', checked)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {categoryToEdit ? 'Save Changes' : 'Add Category'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
