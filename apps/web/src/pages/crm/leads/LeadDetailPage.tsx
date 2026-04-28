import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, PhoneForwarded, Edit2, CalendarClock, MessageSquare, MapPin, Building2, User, Target, CircleDollarSign } from 'lucide-react';
import { useLead, useChangeLeadStage, useAddLeadNote, useMarkLeadWon } from '@/hooks/api/useLeads';
import { PipelineStage, formatIndianDate, formatINR } from '@textilepro/shared';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LeadModal } from './components/LeadModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const STAGE_ORDER = [
    PipelineStage.NEW,
    PipelineStage.CONTACTED,
    PipelineStage.FOLLOWUP,
    PipelineStage.SAMPLE_SENT,
    PipelineStage.RATE_SHARED,
    PipelineStage.NEGOTIATION,
    PipelineStage.WON
]; // Lost can be out of regular progression

export function LeadDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');

    const { data: leadResponse, isLoading } = useLead(id || '');
    const changeStage = useChangeLeadStage();
    const addNote = useAddLeadNote();
    const markWon = useMarkLeadWon();

    if (isLoading) {
        return <div className="space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <Skeleton className="h-[400px] w-full" />
        </div>;
    }

    const lead = leadResponse as ILead | undefined;
    if (!lead) return <div>Lead not found</div>;

    const currentStageIndex = STAGE_ORDER.indexOf(lead.pipelineStage);

    const handleNextStage = () => {
        if (currentStageIndex < STAGE_ORDER.length - 2) { // up to NEGOTIATION
            changeStage.mutate({ id: lead._id, stage: STAGE_ORDER[currentStageIndex + 1] });
        } else if (currentStageIndex === STAGE_ORDER.length - 2) {
            markWon.mutate({ id: lead._id });
        }
    };

    const submitNote = () => {
        if (!noteContent.trim()) return;
        addNote.mutate({ id: lead._id, note: noteContent }, {
            onSuccess: () => {
                setIsNoteModalOpen(false);
                setNoteContent('');
            }
        });
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex items-center gap-4 py-2">
                <Button variant="ghost" size="icon" onClick={() => navigate('/app/crm/leads')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold tracking-tight">{lead.companyName}</h1>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase
              ${lead.temperature === 'HOT' ? 'bg-red-100 text-red-700' :
                                lead.temperature === 'WARM' ? 'bg-orange-100 text-orange-700' :
                                    'bg-blue-100 text-blue-700'}`}>
                            {lead.temperature}
                        </span>
                    </div>
                    <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                        <span className="font-mono bg-muted/50 px-1 rounded">{lead.leadNumber}</span> •
                        Created {formatIndianDate(lead.createdAt)}
                    </p>
                </div>
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Details
                </Button>
            </div>

            {/* Pipeline Progress Area */}
            {lead.pipelineStage !== 'LOST' && (
                <Card className="border-blue-100 bg-blue-50/20">
                    <CardContent className="py-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                            <div className="flex-1 w-full max-w-2xl relative">
                                <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-muted rounded-full"></div>
                                <div className="absolute top-1/2 left-0 h-1 -translate-y-1/2 bg-primary rounded-full transition-all duration-500"
                                    style={{ width: `${Math.max(0, (currentStageIndex / (STAGE_ORDER.length - 1)) * 100)}%` }}></div>

                                <div className="relative flex justify-between w-full z-10 text-xs font-medium text-muted-foreground">
                                    {STAGE_ORDER.map((s, i) => (
                                        <div key={s} className="flex flex-col items-center gap-2">
                                            <div className={`w-4 h-4 rounded-full border-2 transition-colors duration-300
                        ${i <= currentStageIndex ? 'bg-primary border-primary' : 'bg-background border-muted'}`}
                                            />
                                            <span className={i === currentStageIndex ? 'text-primary font-bold' : ''}>
                                                {s.replace('_', ' ')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    variant="default"
                                    className={currentStageIndex === STAGE_ORDER.length - 2 ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                                    disabled={currentStageIndex >= STAGE_ORDER.length - 1 || changeStage.isPending || markWon.isPending}
                                    onClick={handleNextStage}
                                >
                                    {currentStageIndex === STAGE_ORDER.length - 2 ? 'Mark Won!' : 'Move to Next Stage'}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {lead.pipelineStage === 'LOST' && (
                <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                    <h3 className="font-bold flex items-center gap-2"><Target className="w-5 h-5" /> Lead Lost</h3>
                    <p className="text-sm mt-1">Reason: {lead.lostReason || 'Not specified'}</p>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-6">
                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-12 bg-transparent p-0 space-x-6">
                            <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">Overview</TabsTrigger>
                            <TabsTrigger value="timeline" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12">Activity Timeline</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2"><Building2 className="w-5 h-5" /> Business Information</CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Lead Type</p>
                                        <p className="font-medium capitalize">{lead.leadType.toLowerCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Source</p>
                                        <p className="font-medium capitalize">{lead.source.toLowerCase()}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Expected Monthly Volume</p>
                                        <p className="font-medium">{lead.monthlyRequirementMeters ? `${lead.monthlyRequirementMeters.toLocaleString()} Mtrs` : '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Value Estimate</p>
                                        <p className="font-medium">{lead.estimatedMonthlyValue ? formatINR(lead.estimatedMonthlyValue) : '-'}</p>
                                    </div>
                                    <div className="sm:col-span-2 pt-2 border-t mt-2">
                                        <p className="text-muted-foreground mb-1">Internal Notes</p>
                                        <p className="font-medium whitespace-pre-wrap">{lead.notes || 'No notes provided.'}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2"><User className="w-5 h-5" /> Contact Details</CardTitle>
                                </CardHeader>
                                <CardContent className="grid sm:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                    <div>
                                        <p className="text-muted-foreground mb-1">Person</p>
                                        <p className="font-medium">{lead.contactPerson || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">Location</p>
                                        <p className="font-medium">{lead.city}{lead.state ? `, ${lead.state}` : ''}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground mb-1">GSTIN</p>
                                        <p className="font-mono font-medium">{lead.gstin || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="timeline" className="mt-6">
                            <Card>
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle className="text-lg flex items-center gap-2"><CalendarClock className="w-5 h-5" /> Timeline Log</CardTitle>
                                    <Button variant="outline" size="sm" onClick={() => setIsNoteModalOpen(true)}>
                                        <MessageSquare className="w-4 h-4 mr-2" /> Add Note
                                    </Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                                        {/* Reverse the timeline arr */}
                                        {lead.timeline?.map((activity: any, index: number) => (
                                            <div key={activity._id || index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-background bg-slate-200 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                                                    {activity.type === 'NOTE_ADDED' ? <MessageSquare className="w-4 h-4" /> :
                                                        activity.type === 'STAGE_CHANGED' ? <Target className="w-4 h-4" /> :
                                                            <CalendarClock className="w-4 h-4" />}
                                                </div>
                                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-card border p-4 rounded-xl shadow-sm">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-bold text-sm tracking-tight">{activity.title}</h4>
                                                        <time className="text-xs font-medium text-muted-foreground">{new Date(activity.createdAt).toLocaleDateString()} {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                                                    </div>
                                                    {activity.description && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{activity.description}</p>}
                                                </div>
                                            </div>
                                        ))}
                                        {(!lead.timeline || lead.timeline.length === 0) && (
                                            <p className="text-center text-muted-foreground py-8">No activity recorded yet.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <Card className="border-t-4 border-t-primary">
                        <CardHeader>
                            <CardTitle className="text-lg">Quick Contacts</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <a href={`tel:${lead.phone}`}>
                                <Button className="w-full justify-start bg-slate-100 hover:bg-slate-200 text-slate-900 border" variant="outline">
                                    <Phone className="w-4 h-4 mr-3 text-blue-600" /> Call {lead.phone}
                                </Button>
                            </a>
                            {lead.whatsapp && (
                                <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}?text=Hello ${lead.contactPerson},`} target="_blank" rel="noreferrer">
                                    <Button className="w-full justify-start bg-slate-100 hover:bg-slate-200 text-slate-900 border" variant="outline">
                                        <PhoneForwarded className="w-4 h-4 mr-3 text-emerald-600" /> WhatsApp {lead.whatsapp}
                                    </Button>
                                </a>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conversion Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Win probability based on stage pattern highlights. Mark as Won to automatically migrate to core Party module.
                            </p>
                            <Button
                                variant="outline"
                                className="w-full justify-start border-emerald-200 hover:bg-emerald-50 text-emerald-700 hover:text-emerald-800"
                                onClick={() => markWon.mutate({ id: lead._id })}
                                disabled={lead.pipelineStage === 'WON'}
                            >
                                <CircleDollarSign className="w-4 h-4 mr-3" /> Mark Lead as Won!
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <LeadModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                lead={lead}
            />

            <Dialog open={isNoteModalOpen} onOpenChange={setIsNoteModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Record a call summary, internal note, or context..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            rows={4}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => { setIsNoteModalOpen(false); setNoteContent(''); }}>Cancel</Button>
                        <Button onClick={submitNote} disabled={!noteContent.trim() || addNote.isPending}>Save Note</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
