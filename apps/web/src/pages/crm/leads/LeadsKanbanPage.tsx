import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Phone, MapPin, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLeads, useChangeLeadStage } from '@/hooks/api/useLeads';
import { PipelineStage, ILead } from '@textilepro/shared';
import { LeadModal } from './components/LeadModal';
import { cn } from '@/lib/utils';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const STAGES = [
    PipelineStage.NEW,
    PipelineStage.CONTACTED,
    PipelineStage.FOLLOWUP,
    PipelineStage.SAMPLE_SENT,
    PipelineStage.RATE_SHARED,
    PipelineStage.NEGOTIATION,
];

export function LeadsKanbanPage() {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedLead, setDraggedLead] = useState<ILead | null>(null);

    // We are fetching the first 100 leads to show actively on Kanban
    const { data, isLoading } = useLeads({
        limit: 100,
    });

    const changeStageParams = useChangeLeadStage();

    const handleDragStart = (e: React.DragEvent, lead: ILead) => {
        setDraggedLead(lead);
        e.dataTransfer.setData('text/plain', lead._id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault(); // necessary to allow dropping
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetStage: PipelineStage) => {
        e.preventDefault();
        if (!draggedLead) return;

        if (draggedLead.pipelineStage !== targetStage) {
            changeStageParams.mutate({ id: draggedLead._id, stage: targetStage });
        }
        setDraggedLead(null);
    };

    const activeLeads: ILead[] = (data?.data?.data || []).filter((l: ILead) => l.pipelineStage !== 'WON' && l.pipelineStage !== 'LOST');

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex justify-between items-center shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Leads Kanban</h1>
                    <p className="text-muted-foreground mt-1">Drag and drop leads to change pipeline stages</p>
                </div>
                <div className="flex gap-3">
                    <div className="bg-muted p-1 rounded-lg flex items-center">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/app/crm/leads')}>
                            <List className="mr-2 h-4 w-4" /> Table
                        </Button>
                        <Button variant="secondary" size="sm" className="shadow-sm">
                            <span className="mr-2 h-4 w-4">#</span> Kanban
                        </Button>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">Loading pipeline...</div>
            ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start min-h-0">
                    {STAGES.map((stage) => {
                        const stageLeads = activeLeads.filter((l) => l.pipelineStage === stage);

                        return (
                            <div
                                key={stage}
                                className={cn(
                                    "flex-shrink-0 w-80 bg-muted/40 rounded-xl p-3 flex flex-col max-h-full overflow-hidden border border-border/50",
                                    draggedLead && "bg-muted/80 border-dashed" // slight highlight if dragging
                                )}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage)}
                            >
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <h3 className="font-semibold text-sm capitalize">{stage.replace(/_/g, ' ').toLowerCase()}</h3>
                                    <span className="text-xs font-medium bg-background px-2.5 py-1 rounded-full shadow-sm text-muted-foreground border">
                                        {stageLeads.length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto min-h-[150px] space-y-3 pb-2 px-1">
                                    {stageLeads.length === 0 ? (
                                        <div className="text-center text-xs text-muted-foreground pt-4 border-2 border-dashed border-border/50 rounded-lg p-6 bg-background/50">
                                            Drag leads here
                                        </div>
                                    ) : (
                                        stageLeads.map((lead) => (
                                            <Card
                                                key={lead._id}
                                                className="cursor-move hover:shadow-md transition-shadow group relative overflow-hidden"
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, lead)}
                                                onClick={() => navigate(`/app/crm/leads/${lead._id}`)}
                                            >
                                                <CardContent className="p-3">
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <h4 className="font-medium text-sm leading-tight mb-1 group-hover:text-primary transition-colors">{lead.companyName}</h4>
                                                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{lead.contactPerson || lead.leadType}</p>
                                                        </div>
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted">
                                                                    <MoreVertical className="h-3 w-3" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-40">
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/app/crm/leads/${lead._id}`); }}>
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); changeStageParams.mutate({ id: lead._id, stage: PipelineStage.WON }); }}>
                                                                    Mark as Won
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem className="text-destructive" onClick={(e) => { e.stopPropagation(); changeStageParams.mutate({ id: lead._id, stage: PipelineStage.LOST }); }}>
                                                                    Mark as Lost
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>

                                                    <div className="mt-3 flex items-center justify-between">
                                                        <div className="flex items-center text-xs text-muted-foreground gap-2">
                                                            <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {lead.phone}</span>
                                                        </div>
                                                        {lead.temperature === 'HOT' && (
                                                            <span className="w-2 h-2 rounded-full bg-red-500" title="Hot Lead" />
                                                        )}
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <LeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
