import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Eye, Save, Plus, Trash2, Shield, CreditCard, ChevronRight, ExternalLink, Check, X, AlertTriangle, Send, RefreshCw, Loader2, Edit } from 'lucide-react';
import { INDIAN_STATES_MAP } from '@textilepro/shared';
import { api } from '@/lib/api';
import { toast } from 'sonner';

/* ═══════════════════════════════════════════════════════════
   SECTION 1: BUSINESS PROFILE
   ═══════════════════════════════════════════════════════════ */
export function ProfileSettings({ settings, onChange }: any) {
    const p = settings?.profile || {};
    const set = (key: string, val: any) => onChange({ profile: { ...p, [key]: val } });

    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = React.useState(false);

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('file', file);

            // Use native fetch to avoid Axios default Content-Type: application/json
            // which prevents the browser from setting the correct multipart boundary
            const res = await fetch('/api/upload', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data?.url) {
                set('logo', data.url);
                toast.success('Logo uploaded successfully');
            } else {
                throw new Error(data?.error?.message || 'Upload failed');
            }
        } catch (error: any) {
            toast.error(error.message || 'Failed to upload logo');
            console.error('Upload error', error);
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div>
                <h2 className="text-xl font-bold">Business Profile</h2>
                <p className="text-muted-foreground text-sm">Your company identity across all documents and communications.</p>
            </div>

            {/* Logo Upload */}
            <Card className="border-dashed">
                <CardContent className="p-6 flex items-center gap-6">
                    {p.logo ? (
                        <div className="relative group">
                            <img src={p.logo} alt="Company Logo" className="w-20 h-20 rounded-xl object-contain border border-primary/20 bg-white" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-2xl font-black border border-primary/20">
                            {p.businessName?.[0] || 'T'}
                        </div>
                    )}
                    <div className="flex-1">
                        <p className="font-semibold text-sm">Company Logo</p>
                        <p className="text-xs text-muted-foreground mb-2">PNG, JPG up to 2MB. Appears on challans, invoices, and reports.</p>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                            {uploading ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Upload className="w-3.5 h-3.5 mr-2" />}
                            {uploading ? 'Uploading...' : 'Upload Logo'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Business Name" value={p.businessName} onChange={(v: string) => set('businessName', v)} placeholder="TextilePro Fabrics" />
                <SettingsField label="Legal Name" value={p.legalName} onChange={(v: string) => set('legalName', v)} placeholder="TextilePro Fabrics Pvt Ltd" />
                <SettingsField label="GSTIN" value={p.gstin} onChange={(v: string) => set('gstin', v)} placeholder="24AABCT1332E1ZH" />
                <SettingsField label="PAN" value={p.pan} onChange={(v: string) => set('pan', v)} placeholder="AABCT1332E" />
                <SettingsField label="Phone" value={p.phoneNumbers?.[0]} onChange={(v: string) => set('phoneNumbers', [v])} placeholder="+91 99999 99999" />
                <SettingsField label="Email" value={p.email} onChange={(v: string) => set('email', v)} placeholder="info@business.com" type="email" />
                <SettingsField label="Website" value={p.website} onChange={(v: string) => set('website', v)} placeholder="https://business.com" />
                <SettingsField label="Owner Name" value={p.ownerName} onChange={(v: string) => set('ownerName', v)} placeholder="Rajesh Shah" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="City" value={p.address?.city} onChange={(v: string) => set('address', { ...p.address, city: v })} placeholder="Surat" />
                <SettingsSelect
                    label="State"
                    value={p.address?.state || ''}
                    onChange={(v: string) => set('address', { ...p.address, state: v })}
                    options={Object.values(INDIAN_STATES_MAP).map(s => ({ v: s, l: s }))}
                />
                <SettingsField label="Pincode" value={p.address?.pincode} onChange={(v: string) => set('address', { ...p.address, pincode: v })} placeholder="395003" />
                <SettingsField label="Country" value={p.address?.country} onChange={(v: string) => set('address', { ...p.address, country: v })} placeholder="India" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SettingsSelect label="Default Language" value={p.defaultLanguage || 'en'} onChange={(v: string) => set('defaultLanguage', v)} options={[{ v: 'en', l: 'English' }, { v: 'hi', l: 'Hindi' }, { v: 'gu', l: 'Gujarati' }]} />
                <SettingsSelect label="Timezone" value={p.timezone || 'Asia/Kolkata'} onChange={(v: string) => set('timezone', v)} options={[{ v: 'Asia/Kolkata', l: 'Asia/Kolkata (IST)' }, { v: 'UTC', l: 'UTC' }]} />
                <SettingsSelect label="Currency" value={p.currency || 'INR'} onChange={(v: string) => set('currency', v)} options={[{ v: 'INR', l: '₹ INR' }, { v: 'USD', l: '$ USD' }, { v: 'AED', l: 'د.إ AED' }]} />
            </div>

            <Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5 mr-2" />Preview Document Branding</Button>
        </div>
    );
}

import { useUsers, useCreateUser, useDeleteUser, useUpdateUser } from '@/hooks/api/useUsers';
import { useBranches, useCreateBranch, useDeleteBranch, useUpdateBranch } from '@/hooks/api/useBranches';
import { ROLE_PERMISSIONS, UserRole, IUser, IBranch } from '@textilepro/shared';

/* ═══════════════════════════════════════════════════════════
   SECTION 2: USERS & ROLES
   ═══════════════════════════════════════════════════════════ */
export function UsersSettings({ settings, onChange }: any) {
    const { data: usersData, isLoading } = useUsers();
    const [addingUser, setAddingUser] = React.useState(false);
    const [newUserState, setNewUserState] = React.useState({ name: '', email: '', mobile: '', role: 'SALESMAN' });

    const createUser = useCreateUser();
    const deleteUser = useDeleteUser();
    const updateUser = useUpdateUser();

    // Permissions List
    const ALL_PERMS = ['challans:read', 'challans:write', 'invoices:read', 'invoices:write', 'inventory:read', 'inventory:write', 'crm:read', 'reports:read', 'parties:read', 'parties:write'];

    // Default Roles Matrix
    const defaultRoles = Object.keys(UserRole);

    // Custom Roles from settings
    const secSettings = settings?.security || {};
    const customRolesList: Array<{ id: string, name: string, permissions: string[] }> = secSettings.customRoles || [];

    const togglePermission = (roleId: string, perm: string) => {
        if (roleId === 'OWNER') return; // Cannot edit OWNER
        let roles = [...customRolesList];
        const roleIndex = roles.findIndex(r => r.id === roleId);

        if (roleIndex > -1) {
            const hasPerm = roles[roleIndex].permissions.includes(perm);
            if (hasPerm) roles[roleIndex].permissions = roles[roleIndex].permissions.filter(p => p !== perm);
            else roles[roleIndex].permissions.push(perm);
        } else {
            // trying to edit default role so we copy it to custom overrides
            let defaultPerms = ROLE_PERMISSIONS[roleId as UserRole] || [];
            let newPerms = defaultPerms.includes('*') ? [...ALL_PERMS] : [...defaultPerms];
            if (newPerms.includes(perm)) {
                newPerms = newPerms.filter(p => p !== perm);
            } else {
                newPerms.push(perm);
            }
            roles.push({ id: roleId, name: roleId, permissions: newPerms });
        }

        onChange({ security: { ...secSettings, customRoles: roles } });
    };

    const addCustomRole = () => {
        const name = prompt("Enter new role name:", "New Role");
        if (name) {
            const id = name.toUpperCase().replace(/\s+/g, '_');
            const newRole = { id, name, permissions: [] };
            onChange({ security: { ...secSettings, customRoles: [...customRolesList, newRole] } });
        }
    };

    const handleCreateUser = () => {
        if (!newUserState.name || !newUserState.email) return toast.error('Name & Email Required');
        createUser.mutate(newUserState, {
            onSuccess: () => setAddingUser(false)
        });
    };

    const isCustomRole = (r: string) => customRolesList.some(cr => cr.id === r);

    return (
        <div className="space-y-8 animate-in fade-in-50">
            {/* Header */}
            <div>
                <h2 className="text-xl font-bold">Users & Roles</h2>
                <p className="text-muted-foreground text-sm">Manage team access and live role permissions.</p>
            </div>

            {/* Team Members List */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                        <h3 className="font-semibold px-2">Team Members</h3>
                        <Button size="sm" onClick={() => setAddingUser(!addingUser)}>
                            <Plus className="w-3.5 h-3.5 mr-2" />Add User
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-xs text-muted-foreground uppercase border-b">
                                <tr>
                                    <th className="text-left font-medium p-4">Name</th>
                                    <th className="text-left font-medium p-4">Email</th>
                                    <th className="text-left font-medium p-4">Role</th>
                                    <th className="text-center font-medium p-4">Status</th>
                                    <th className="text-right font-medium p-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {addingUser && (
                                    <tr className="bg-primary/5">
                                        <td className="p-3"><Input placeholder="Jane Doe" className="h-8" value={newUserState.name} onChange={e => setNewUserState({ ...newUserState, name: e.target.value })} /></td>
                                        <td className="p-3"><Input placeholder="jane@tex.com" type="email" className="h-8" value={newUserState.email} onChange={e => setNewUserState({ ...newUserState, email: e.target.value })} /></td>
                                        <td className="p-3">
                                            <Select value={newUserState.role} onValueChange={v => setNewUserState({ ...newUserState, role: v })}>
                                                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {defaultRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                    {customRolesList.map(r => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </td>
                                        <td className="p-3 text-center"><Badge variant="outline">Pending</Badge></td>
                                        <td className="p-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button size="sm" variant="ghost" onClick={() => setAddingUser(false)}>Cancel</Button>
                                                <Button size="sm" onClick={handleCreateUser} disabled={createUser.isPending}>{createUser.isPending ? 'Saving...' : 'Save'}</Button>
                                            </div>
                                        </td>
                                    </tr>
                                )}

                                {isLoading ? (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></td></tr>
                                ) : usersData?.map((u: IUser) => (
                                    <tr key={u._id} className="hover:bg-muted/10 transition-colors">
                                        <td className="p-4 font-medium">{u.name}</td>
                                        <td className="p-4 text-muted-foreground">{u.email}</td>
                                        <td className="p-4">
                                            <Badge variant="secondary" className="font-mono text-[10px]">{u.role}</Badge>
                                        </td>
                                        <td className="p-4 text-center">
                                            {u.isActive ? (
                                                <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20">Active</Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-rose-600 dark:text-rose-400 border-rose-500/20 bg-rose-500/10">Inactive</Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0"
                                                onClick={() => deleteUser.mutate(u._id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {!isLoading && usersData?.length === 0 && !addingUser && (
                                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No users found. Invite your team!</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Live Role Permissions Matrix */}
            <Card>
                <div className="flex items-center justify-between p-4 border-b bg-muted/20">
                    <h3 className="font-semibold px-2">Role Permissions Matrix</h3>
                    <Button variant="outline" size="sm" onClick={addCustomRole}>
                        <Shield className="w-3.5 h-3.5 mr-2 text-indigo-600" />Create Custom Role
                    </Button>
                </div>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead className="bg-muted/50 text-muted-foreground border-b uppercase">
                                <tr>
                                    <th className="text-left font-semibold p-4">Role / Title</th>
                                    {ALL_PERMS.map(p => <th key={p} className="p-4 text-center font-medium font-mono lowercase tracking-wider">{p.split(':')[0]}<br />{p.split(':')[1]}</th>)}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {/* Map Default Built-in Roles */}
                                {defaultRoles.map(r => {
                                    const isOwner = r === 'OWNER';
                                    const customOverride = customRolesList.find(cr => cr.id === r);
                                    let activePerms = ROLE_PERMISSIONS[r as UserRole] || [];
                                    if (customOverride) activePerms = customOverride.permissions;

                                    return (
                                        <tr key={r} className="hover:bg-muted/50 transition-colors bg-muted/20">
                                            <td className="p-4 font-semibold text-foreground flex items-center gap-2">
                                                {r} <Badge variant="secondary" className="px-1 py-0 text-[9px] rounded-sm">System</Badge>
                                            </td>
                                            {ALL_PERMS.map(p => {
                                                const hasP = isOwner || activePerms.includes('*') || activePerms.includes(p);
                                                return (
                                                    <td key={p} className="p-4 text-center">
                                                        {isOwner ? (
                                                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                                                        ) : (
                                                            <Switch
                                                                checked={hasP}
                                                                onCheckedChange={() => togglePermission(r, p)}
                                                            />
                                                        )}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}

                                {/* Map Custom Editable Roles */}
                                {customRolesList.filter(cr => !defaultRoles.includes(cr.id)).map(cr => (
                                    <tr key={cr.id} className="hover:bg-primary/5 transition-colors">
                                        <td className="p-4 font-semibold text-primary">{cr.name}</td>
                                        {ALL_PERMS.map(p => {
                                            const hasP = cr.permissions.includes(p);
                                            return (
                                                <td key={p} className="p-4 text-center">
                                                    <Switch
                                                        checked={hasP}
                                                        onCheckedChange={() => togglePermission(cr.id, p)}
                                                    />
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 3: BRANCHES
   ═══════════════════════════════════════════════════════════ */
export function BranchesSettings({ settings, onChange }: any) {
    const { data: branches, isLoading } = useBranches();
    const createBranch = useCreateBranch();
    const updateBranch = useUpdateBranch();
    const deleteBranch = useDeleteBranch();

    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingId, setEditingId] = React.useState<string | null>(null);
    const [formData, setFormData] = React.useState<Partial<IBranch>>({
        branchCode: '', branchName: '', type: 'HEAD_OFFICE', address: '', city: '', state: '', country: 'India', gstin: '', phone: ''
    });

    const resetForm = () => {
        setFormData({ branchCode: '', branchName: '', type: 'WAREHOUSE', address: '', city: '', state: '', country: 'India', gstin: '', phone: '' });
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleSave = () => {
        if (!formData.branchCode || !formData.branchName || !formData.city) return toast.error('Branch Code, Name, and City are required');

        if (editingId) updateBranch.mutate({ id: editingId, data: formData }, { onSuccess: resetForm });
        else createBranch.mutate(formData, { onSuccess: resetForm });
    };

    const handleEdit = (b: IBranch) => {
        setFormData({ ...b });
        setEditingId(b._id);
        setIsFormOpen(true);
    };

    const BRANCH_TYPES = ['HEAD_OFFICE', 'WAREHOUSE', 'FACTORY', 'SALES_OFFICE', 'RETAIL_STORE'];

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div className="flex items-center justify-between">
                <div><h2 className="text-xl font-bold">Branches</h2><p className="text-muted-foreground text-sm">Manage multiple locations and warehouses.</p></div>
                <Button size="sm" onClick={() => { resetForm(); setIsFormOpen(true); }}><Plus className="w-3.5 h-3.5 mr-2" />Add Branch</Button>
            </div>

            {isFormOpen && (
                <Card className="border-primary/30">
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-semibold">{editingId ? 'Edit Branch' : 'Add New Branch'}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><label className="text-xs font-medium">Branch Name *</label><Input value={formData.branchName || ''} onChange={e => setFormData({ ...formData, branchName: e.target.value })} placeholder="e.g. Surat Warehouse" /></div>
                            <div className="space-y-2"><label className="text-xs font-medium">Branch Code *</label><Input value={formData.branchCode || ''} onChange={e => setFormData({ ...formData, branchCode: e.target.value })} placeholder="e.g. WH-SURAT" /></div>
                            <div className="space-y-2">
                                <label className="text-xs font-medium">Type</label>
                                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as any })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>{BRANCH_TYPES.map(t => <SelectItem key={t} value={t}>{t.replace('_', ' ')}</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2"><label className="text-xs font-medium">City *</label><Input value={formData.city || ''} onChange={e => setFormData({ ...formData, city: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-xs font-medium">State</label><Input value={formData.state || ''} onChange={e => setFormData({ ...formData, state: e.target.value })} /></div>
                            <div className="space-y-2"><label className="text-xs font-medium">GSTIN</label><Input value={formData.gstin || ''} onChange={e => setFormData({ ...formData, gstin: e.target.value })} /></div>
                            <div className="col-span-2 space-y-2"><label className="text-xs font-medium">Full Address</label><Input value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} /></div>
                        </div>
                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="ghost" onClick={resetForm}>Cancel</Button>
                            <Button onClick={handleSave} disabled={createBranch.isPending || updateBranch.isPending}>
                                {(createBranch.isPending || updateBranch.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Branch'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isLoading ? (
                <div className="p-8 text-center text-muted-foreground"><Loader2 className="w-5 h-5 mx-auto animate-spin" /></div>
            ) : branches?.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                        <p className="text-sm">No branches configured.</p>
                        <p className="text-xs mt-1">Each branch gets its own inventory, staff, and challan sequences.</p>
                        <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>Create First Branch</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {branches?.map((b) => (
                        <Card key={b._id} className="hover:border-primary/30 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{b.branchName} <span className="opacity-50 mx-1">—</span> <span className="text-muted-foreground font-normal">{b.city}</span></p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <Badge variant="secondary" className="px-1 py-0 text-[10px]">{b.type.replace('_', ' ')}</Badge>
                                        <span>Code: {b.branchCode}</span>
                                        {b.gstin && <span>• GST: {b.gstin}</span>}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => handleEdit(b)}><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400 hover:bg-rose-500/10" onClick={() => { if (confirm('Are you sure you want to delete this branch?')) deleteBranch.mutate(b._id); }}>
                                        {deleteBranch.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 4: BILLING & SUBSCRIPTION
   ═══════════════════════════════════════════════════════════ */
export function BillingSettings({ settings }: any) {
    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Billing & Subscription</h2><p className="text-muted-foreground text-sm">Manage your plan, usage, and payment methods.</p></div>

            <Card className="border-primary/30 bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Current Plan</p>
                            <p className="text-2xl font-black mt-1">Free Tier</p>
                            <p className="text-sm text-muted-foreground">Unlimited during beta</p>
                        </div>
                        <Button>Manage Plan</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                    <p className="text-sm">Subscription management will be available when paid plans launch.</p>
                    <p className="text-xs mt-1">Payment methods, invoices, and add-ons will appear here.</p>
                </CardContent>
            </Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 5: CHALLAN SETTINGS
   ═══════════════════════════════════════════════════════════ */
export function ChallanSettings({ settings, onChange }: any) {
    const c = settings?.challans || {};
    const set = (key: string, val: any) => onChange({ challans: { ...c, [key]: val } });

    const templates = [
        { id: 'classic', name: 'Classic', desc: 'Clean traditional layout' },
        { id: 'modern', name: 'Modern', desc: 'Sleek minimal design' },
        { id: 'detailed', name: 'Detailed', desc: 'Full info with HSN/tax' },
    ];

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Challan Settings</h2><p className="text-muted-foreground text-sm">Configure numbering, defaults, PDF generation, and templates.</p></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SettingsField label="Numbering Format" value={c.numberingFormat || 'YY-MM-SEQ'} onChange={(v: string) => set('numberingFormat', v)} placeholder="YY-MM-SEQ" />
                <SettingsField label="Prefix" value={c.prefix || 'CH'} onChange={(v: string) => set('prefix', v)} placeholder="CH" />
                <SettingsField label="Suffix" value={c.suffix} onChange={(v: string) => set('suffix', v)} placeholder="Optional" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Default Terms" value={c.defaultTerms} onChange={(v: string) => set('defaultTerms', v)} placeholder="Goods once sold will not be returned." />
                <SettingsField label="Default Remarks" value={c.defaultRemarks} onChange={(v: string) => set('defaultRemarks', v)} placeholder="Thank you for your business!" />
            </div>

            <Card><CardContent className="p-4 grid grid-cols-2 md:grid-cols-3 gap-y-4">
                <SettingsToggle label="Financial Year Reset" checked={c.financialYearReset ?? true} onChange={(v: boolean) => set('financialYearReset', v)} />
                <SettingsToggle label="Show Rates" checked={c.showRates ?? true} onChange={(v: boolean) => set('showRates', v)} />
                <SettingsToggle label="Show Amount" checked={c.showAmount ?? true} onChange={(v: boolean) => set('showAmount', v)} />
                <SettingsToggle label="Require Vehicle No." checked={c.requireVehicleNo ?? false} onChange={(v: boolean) => set('requireVehicleNo', v)} />
                <SettingsToggle label="Require Broker" checked={c.requireBroker ?? false} onChange={(v: boolean) => set('requireBroker', v)} />
                <SettingsToggle label="Auto PDF Generate" checked={c.autoPdfGenerate ?? true} onChange={(v: boolean) => set('autoPdfGenerate', v)} />
                <SettingsToggle label="Auto WhatsApp Send" checked={c.autoWhatsappSend ?? false} onChange={(v: boolean) => set('autoWhatsappSend', v)} />
            </CardContent></Card>

            <div>
                <h3 className="font-semibold mb-3">Challan Template Gallery</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {templates.map(t => (
                        <Card key={t.id} className={`cursor-pointer transition-all hover:border-primary/50 ${(c.templateId || 'classic') === t.id ? 'border-primary ring-2 ring-primary/20' : ''}`}
                            onClick={() => set('templateId', t.id)}>
                            <CardContent className="p-4">
                                <div className="h-24 rounded bg-muted/30 mb-3 flex items-center justify-center text-muted-foreground text-xs">{t.name} Preview</div>
                                <p className="font-semibold text-sm">{t.name}</p>
                                <p className="text-xs text-muted-foreground">{t.desc}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <Button variant="outline" size="sm"><Upload className="w-3.5 h-3.5 mr-2" />Upload Signature</Button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 6: INVOICES & GST
   ═══════════════════════════════════════════════════════════ */
export function InvoiceSettings({ settings, onChange }: any) {
    const inv = settings?.invoices || {};
    const set = (key: string, val: any) => onChange({ invoices: { ...inv, [key]: val } });

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Invoices & GST</h2><p className="text-muted-foreground text-sm">Invoice numbering, tax configuration, and e-invoicing setup.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsField label="Invoice Numbering Format" value={inv.numberingFormat} onChange={(v: string) => set('numberingFormat', v)} placeholder="INV-YY-SEQ" />
                <SettingsSelect label="GST Mode" value={inv.gstMode || 'regular'} onChange={(v: string) => set('gstMode', v)} options={[{ v: 'regular', l: 'Regular' }, { v: 'composition', l: 'Composition' }, { v: 'unregistered', l: 'Unregistered' }]} />
                <SettingsField label="Default HSN Code" value={inv.defaultHsn} onChange={(v: string) => set('defaultHsn', v)} placeholder="5407" />
                <SettingsField label="Default Tax Rate (%)" value={inv.defaultTaxRate} onChange={(v: string) => set('defaultTaxRate', parseFloat(v) || 0)} placeholder="5" type="number" />
                <SettingsSelect label="e-Invoice Provider" value={inv.eInvoiceProvider || 'none'} onChange={(v: string) => set('eInvoiceProvider', v)} options={[{ v: 'none', l: 'Not Configured' }, { v: 'cleartax', l: 'ClearTax' }, { v: 'masters', l: 'Masters India' }]} />
                <SettingsSelect label="eWay Bill Provider" value={inv.eWayBillProvider || 'none'} onChange={(v: string) => set('eWayBillProvider', v)} options={[{ v: 'none', l: 'Not Configured' }, { v: 'cleartax', l: 'ClearTax' }]} />
                <SettingsField label="Payment Terms" value={inv.paymentTerms} onChange={(v: string) => set('paymentTerms', v)} placeholder="Net 30" />
                <SettingsField label="Due Days Default" value={inv.dueDaysDefault} onChange={(v: string) => set('dueDaysDefault', parseInt(v) || 30)} placeholder="30" type="number" />
            </div>
            <div className="flex gap-3"><Button variant="outline" size="sm">Test GST Config</Button><Button variant="outline" size="sm"><Eye className="w-3.5 h-3.5 mr-2" />Preview Invoice PDF</Button></div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 7: INVENTORY
   ═══════════════════════════════════════════════════════════ */
export function InventorySettings({ settings, onChange }: any) {
    const inv = settings?.inventory || {};
    const set = (key: string, val: any) => onChange({ inventory: { ...inv, [key]: val } });

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Inventory Settings</h2><p className="text-muted-foreground text-sm">Stock management, thresholds, and tracking preferences.</p></div>
            <SettingsField label="Low Stock Threshold Default" value={inv.lowStockThresholdDefault} onChange={(v: string) => set('lowStockThresholdDefault', parseInt(v) || 10)} placeholder="10" type="number" />
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Allow Negative Stock" checked={inv.allowNegativeStock ?? false} onChange={(v: boolean) => set('allowNegativeStock', v)} />
                <SettingsToggle label="Reserve Stock on Draft Challans" checked={inv.reserveStockOnDraftChallans ?? false} onChange={(v: boolean) => set('reserveStockOnDraftChallans', v)} />
                <SettingsToggle label="Branch Stock Transfers" checked={inv.branchStockTransfersEnabled ?? true} onChange={(v: boolean) => set('branchStockTransfersEnabled', v)} />
                <SettingsToggle label="Roll-wise Tracking" checked={inv.rollWiseTracking ?? true} onChange={(v: boolean) => set('rollWiseTracking', v)} />
                <SettingsToggle label="Barcode Mode (Future)" checked={inv.barcodeMode ?? false} onChange={(v: boolean) => set('barcodeMode', v)} />
            </CardContent></Card>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SECTION 8: FINANCE
   ═══════════════════════════════════════════════════════════ */
export function FinanceSettings({ settings, onChange }: any) {
    const f = settings?.finance || {};
    const set = (key: string, val: any) => onChange({ finance: { ...f, [key]: val } });

    return (
        <div className="space-y-6 animate-in fade-in-50">
            <div><h2 className="text-xl font-bold">Finance & Accounts</h2><p className="text-muted-foreground text-sm">Financial year, banking, and accounting defaults.</p></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SettingsSelect label="Financial Year Start" value={f.financialYearStart || 'april'} onChange={(v: string) => set('financialYearStart', v)} options={[{ v: 'april', l: 'April (India)' }, { v: 'january', l: 'January' }]} />
                <SettingsField label="Expense Approvals Threshold (₹)" value={f.expenseApprovalsThreshold} onChange={(v: string) => set('expenseApprovalsThreshold', parseInt(v) || 5000)} placeholder="5000" type="number" />
            </div>
            <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-2 gap-y-4">
                <SettingsToggle label="Auto Journal Posting" checked={f.autoJournalPosting ?? true} onChange={(v: boolean) => set('autoJournalPosting', v)} />
                <SettingsToggle label="TDS (Future)" checked={f.tdsFutureToggle ?? false} onChange={(v: boolean) => set('tdsFutureToggle', v)} />
            </CardContent></Card>
            <Button variant="outline" size="sm"><Plus className="w-3.5 h-3.5 mr-2" />Manage Bank Accounts</Button>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   SHARED UTILITY COMPONENTS
   ═══════════════════════════════════════════════════════════ */
export function SettingsField({ label, value, onChange, placeholder, type = 'text' }: any) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
            <Input
                value={value || ''}
                onChange={(e: any) => onChange(e.target.value)}
                placeholder={placeholder}
                type={type}
                className="h-9"
                autoComplete={type === 'password' ? 'new-password' : 'off'}
                data-1p-ignore
            />
        </div>
    );
}

export function SettingsSelect({ label, value, onChange, options }: any) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</Label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>{options.map((o: any) => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
        </div>
    );
}

export function SettingsToggle({ label, checked, onChange }: any) {
    return (
        <div className="flex items-center justify-between gap-4 pr-4">
            <Label className="text-sm cursor-pointer">{label}</Label>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}
