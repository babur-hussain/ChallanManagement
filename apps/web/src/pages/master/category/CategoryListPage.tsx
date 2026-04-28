import React, { useState } from 'react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SearchInput } from '@/components/shared/SearchInput';
import { Button } from '@/components/ui/button';
import { DataTable, Column } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories, useDeleteCategory } from '@/hooks/api/useCategories';
import { CategoryModal } from './components/CategoryModal';
import { formatIndianDate } from '@textilepro/shared';

export function CategoryListPage({ hideHeader = false }: { hideHeader?: boolean }) {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const { data, isLoading } = useCategories({ page, limit: 20, search });
    const deleteMutation = useDeleteCategory();

    const handleEdit = (item: any) => {
        setEditingCategory(item);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (deleteId) {
            await deleteMutation.mutateAsync(deleteId);
            setDeleteId(null);
        }
    };

    const columns: Column<any>[] = [
        { key: 'name', header: 'Category Name', cell: (item) => <span className="font-medium text-foreground">{item.name}</span> },
        { key: 'description', header: 'Description', cell: (item) => <span className="text-muted-foreground truncate max-w-[250px]">{item.description || '-'}</span> },
        { key: 'createdAt', header: 'Created On', cell: (item) => formatIndianDate(item.createdAt) },
        {
            key: 'isActive',
            header: 'Status',
            cell: (item) => <StatusBadge status={item.isActive ? 'active' : 'inactive'} />
        },
        {
            key: 'actions',
            header: '',
            align: 'right',
            width: '120px',
            cell: (item) => (
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary no-row-click" onClick={() => handleEdit(item)}>
                        <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive no-row-click" onClick={() => setDeleteId(item._id)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className={hideHeader ? "w-full animate-in fade-in-50" : "container py-4 max-w-7xl animate-in fade-in-50"}>
            {!hideHeader && (
                <PageHeader
                    title="Category Master"
                    description="Manage item and product categories for classification."
                    actions={
                        <Button onClick={handleAddNew} size="sm">
                            <Plus className="mr-2 h-4 w-4" /> Add Category
                        </Button>
                    }
                />
            )}

            <div className="mb-6">
                <SearchInput
                    value={search}
                    onChange={setSearch}
                    placeholder="Search categories by name..."
                    globalShortcut
                    className="w-full sm:max-w-sm"
                />
                {hideHeader && (
                    <Button onClick={handleAddNew} size="sm" className="ml-2 shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                )}
            </div>

            <DataTable
                data={data?.data || []}
                columns={columns}
                keyExtractor={(item) => item._id}
                isLoading={isLoading}
                pagination={{
                    page,
                    limit: data?.pagination?.limit || 20,
                    total: data?.pagination?.total || 0,
                    totalPages: data?.pagination?.totalPages || 1,
                    onPageChange: setPage,
                }}
                emptyTitle="No categories found"
                emptyDescription="Add your first category to start organizing items."
                emptyAction={
                    <Button onClick={handleAddNew} className="mt-4">
                        <Plus className="mr-2 h-4 w-4" /> Add Category
                    </Button>
                }
            />

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                categoryToEdit={editingCategory}
            />

            <ConfirmDialog
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Category"
                description="Are you sure you want to delete this category? This action cannot be undone."
                variant="destructive"
                confirmLabel="Delete"
                isLoading={deleteMutation.isPending}
            />
        </div>
    );
}
