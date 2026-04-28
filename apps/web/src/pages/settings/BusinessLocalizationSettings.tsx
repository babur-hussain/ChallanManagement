import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Save, Globe, Clock, DollarSign, MapPin } from 'lucide-react';
import { useSettingsData, useUpdateSettings } from '@/hooks/api/useSettings';
import { INDIAN_STATES_MAP, UpdateSettingsPayload } from '@textilepro/shared';
import { toast } from 'sonner';

export const BusinessLocalizationSettings = () => {
    const { data: settings, isLoading } = useSettingsData();
    const updateSettingsMutation = useUpdateSettings();

    const { register, handleSubmit, reset, control } = useForm<UpdateSettingsPayload>({
        defaultValues: {
            profile: {
                currency: 'INR',
                timezone: 'Asia/Kolkata',
                ownerState: 'Gujarat'
            }
        }
    });

    useEffect(() => {
        if (settings) {
            reset({
                profile: {
                    currency: settings.profile?.currency || 'INR',
                    timezone: settings.profile?.timezone || 'Asia/Kolkata',
                    ownerState: settings.profile?.ownerState || 'Gujarat'
                }
            });
        }
    }, [settings, reset]);

    const onSubmit = async (data: UpdateSettingsPayload) => {
        try {
            await updateSettingsMutation.mutateAsync(data);
            toast.success('Your localization preferences have been updated.');
        } catch (error) {
            toast.error('Failed to save settings.');
        }
    };

    if (isLoading) return <div className="p-6">Loading settings...</div>;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 bg-slate-50 min-h-screen text-slate-900 max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
                        <Globe className="w-8 h-8 text-primary" />
                        Regional Settings
                    </h1>
                    <p className="text-slate-500 mt-1">Configure your workspace defaults and tax region.</p>
                </div>
                <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-md font-bold shadow-md hover:bg-primary/90 disabled:opacity-50"
                >
                    <Save className="w-4 h-4" />
                    {updateSettingsMutation.isPending ? 'Saving...' : 'Save Preferences'}
                </button>
            </div>

            <Card className="border-slate-200 shadow-sm mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <MapPin className="w-5 h-5 text-slate-400" />
                        Tax Region & Origin
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Firm Owner State <span className="text-destructive">*</span></label>
                            <Controller name="profile.ownerState" control={control} render={({ field }) => (
                                <select {...field} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                                    {Object.values(INDIAN_STATES_MAP).map(state => (
                                        <option key={state} value={state}>{state}</option>
                                    ))}
                                </select>
                            )} />
                            <p className="text-xs text-slate-500 mt-1">Used to determine Inter-state (IGST) vs Intra-state (CGST/SGST) automatically.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm mb-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <DollarSign className="w-5 h-5 text-slate-400" />
                        Base Currency
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Accounting Currency</label>
                            <select {...register('profile.currency')} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                                <option value="INR">INR - Indian Rupee</option>
                                <option value="USD">USD - US Dollar</option>
                                <option value="AED">AED - UAE Dirham</option>
                                <option value="GBP">GBP - British Pound</option>
                                <option value="BDT">BDT - Bangladeshi Taka</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="w-5 h-5 text-slate-400" />
                        Date & Timezone
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Timezone</label>
                            <select {...register('profile.timezone')} className="w-full p-2 border border-slate-300 rounded-md bg-white">
                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                <option value="Europe/London">Europe/London (GMT)</option>
                                <option value="America/New_York">America/New_York (EST)</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

        </form>
    );
};

