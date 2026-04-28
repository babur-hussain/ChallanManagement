import React from 'react';
import { MessageSquare, Phone, MapPin } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

export const InquiriesInbox = () => {
    return (
        <div className="flex h-[calc(100vh-8rem)] gap-4">
            {/* Sidebar List */}
            <Card className="w-1/3 flex flex-col overflow-hidden">
                <CardHeader className="border-b pb-4 shrink-0">
                    <CardTitle>Inquiries</CardTitle>
                </CardHeader>
                <div className="overflow-y-auto flex-1">
                    {/* Inquiry Item */}
                    <div className="p-4 border-b hover:bg-secondary/20 cursor-pointer bg-primary/5 border-l-4 border-l-primary">
                        <div className="flex justify-between">
                            <span className="font-semibold text-sm">Ganesh Boutiques</span>
                            <span className="text-xs text-muted-foreground">2m ago</span>
                        </div>
                        <p className="text-xs font-medium text-primary mt-1">Ref: Premium Georgette</p>
                        <p className="text-sm text-muted-foreground truncate mt-1">Can you do ₹110 for 500 meters?</p>
                        <div className="flex gap-2 mt-2">
                            <Badge variant="warning" className="text-[10px]">NEGOTIATING</Badge>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Chat/Negotiation Area */}
            <Card className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-card shrink-0">
                    <div>
                        <h2 className="font-bold text-lg">Ganesh Boutiques</h2>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> Mumbai</span>
                            <span className="flex items-center gap-1 text-success"><Phone className="w-4 h-4" /> Verified</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline">Convert to Lead</Button>
                        <Button>Mark as WON</Button>
                    </div>
                </div>

                <div className="flex-1 bg-secondary/10 p-4 overflow-y-auto space-y-4">
                    <div className="flex justify-start">
                        <div className="bg-card p-3 rounded-lg shadow-sm border max-w-[80%]">
                            <p className="text-sm">Hi, I am interested in your Premium Georgette (LST-98213-1). Can you do ₹110/m for 500m qty? I need it dispatched to Mumbai by Friday.</p>
                            <span className="text-[10px] text-muted-foreground block text-right mt-1">10:45 AM</span>
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <div className="bg-primary/10 border-primary/20 border p-3 rounded-lg shadow-sm max-w-[80%]">
                            <p className="text-sm">Hello Ganesh Boutiques! For 500m the best we can do is ₹115/m. Dispatch by Friday is confirmed.</p>
                            <span className="text-[10px] text-muted-foreground block text-right mt-1">10:50 AM</span>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t bg-card shrink-0 flex gap-2">
                    <Input placeholder="Type your message..." className="flex-1" />
                    <Button><MessageSquare className="w-4 h-4 mr-2" /> Send</Button>
                </div>
            </Card>
        </div>
    )
}
