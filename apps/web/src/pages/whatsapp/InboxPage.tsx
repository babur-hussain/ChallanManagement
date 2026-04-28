import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    MessageCircle, Send, Search, Paperclip, Smile, Star,
    Pin, User, Phone, Clock, IndianRupee, FileText, Ban,
    ChevronRight, Hash, Sparkles, StickyNote, X,
    MessageSquare, Users, Filter, Inbox, Archive, BellOff,
} from 'lucide-react';
import {
    useConversations, useMessages, useSendMessage, useMarkSeen,
    useCustomerContext, useUpdateConversation,
} from '@/hooks/api/useWhatsApp';
import { formatCurrency, formatDate } from '@textilepro/shared';

const statusColors: Record<string, string> = {
    OPEN: 'bg-emerald-500', PENDING: 'bg-amber-500', CLOSED: 'bg-gray-400', SNOOZED: 'bg-blue-400',
};

type FilterTab = 'ALL' | 'UNREAD' | 'MY' | 'LEADS' | 'CUSTOMERS' | 'STARRED';

export function InboxPage() {
    const [filter, setFilter] = useState<FilterTab>('ALL');
    const [search, setSearch] = useState('');
    const [activeConvId, setActiveConvId] = useState<string | null>(null);
    const [msgText, setMsgText] = useState('');
    const [isNote, setIsNote] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const filterParams: any = {};
    if (filter === 'UNREAD') filterParams.unread = 'true';
    if (filter === 'STARRED') filterParams.isStarred = 'true';
    if (filter === 'LEADS') filterParams.linkedLeadId = 'exists';
    if (filter === 'CUSTOMERS') filterParams.linkedPartyId = 'exists';
    if (search) filterParams.search = search;

    const { data: convsRaw } = useConversations(filterParams);
    const conversations = (convsRaw as any) || [];

    const { data: msgsRaw } = useMessages(activeConvId || '');
    const messages = [...((msgsRaw as any) || [])].reverse();

    const { data: ctxRaw } = useCustomerContext(activeConvId || '');
    const ctx = ctxRaw as any;

    const sendMutation = useSendMessage();
    const seenMutation = useMarkSeen();
    const updateMutation = useUpdateConversation();

    const activeConv = conversations.find((c: any) => c._id === activeConvId);

    useEffect(() => {
        if (activeConvId) {
            seenMutation.mutate(activeConvId);
        }
    }, [activeConvId]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages.length]);

    const handleSend = () => {
        if (!msgText.trim() || !activeConvId) return;
        sendMutation.mutate({
            conversationId: activeConvId,
            type: 'TEXT',
            body: msgText,
            isInternalNote: isNote,
        });
        setMsgText('');
        setIsNote(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleStar = (convId: string) => {
        const conv = conversations.find((c: any) => c._id === convId);
        updateMutation.mutate({ id: convId, data: { isStarred: !conv?.isStarred } });
    };

    const togglePin = (convId: string) => {
        const conv = conversations.find((c: any) => c._id === convId);
        updateMutation.mutate({ id: convId, data: { isPinned: !conv?.isPinned } });
    };

    const setStatus = (convId: string, status: string) => {
        updateMutation.mutate({ id: convId, data: { status } });
    };

    const tabs: { key: FilterTab; label: string; icon: any }[] = [
        { key: 'ALL', label: 'All', icon: Inbox },
        { key: 'UNREAD', label: 'Unread', icon: MessageCircle },
        { key: 'STARRED', label: 'Starred', icon: Star },
        { key: 'CUSTOMERS', label: 'Customers', icon: Users },
        { key: 'LEADS', label: 'Leads', icon: Sparkles },
    ];

    return (
        <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden bg-background animate-in fade-in-50">

            {/* ════════════ LEFT PANEL: Conversation List ════════════ */}
            <div className="w-80 border-r flex flex-col flex-shrink-0">
                {/* Header */}
                <div className="p-3 border-b bg-card">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-base font-bold flex items-center gap-2">
                            <MessageCircle className="h-4 w-4 text-green-600" /> Inbox
                        </h2>
                        <Badge variant="secondary" className="text-xs">{conversations.length}</Badge>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            placeholder="Search name, phone..."
                            className="pl-8 h-8 text-sm"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-0.5 p-1.5 bg-muted/30 overflow-x-auto">
                    {tabs.map(t => (
                        <button key={t.key}
                            className={`flex items-center gap-1 px-2 py-1.5 rounded-md text-[10px] font-medium transition-colors whitespace-nowrap ${filter === t.key ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'
                                }`}
                            onClick={() => setFilter(t.key)}>
                            <t.icon className="h-3 w-3" /> {t.label}
                        </button>
                    ))}
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                            <MessageCircle className="h-8 w-8 mb-2 opacity-30" />
                            <p>No conversations</p>
                        </div>
                    ) : (
                        conversations.map((conv: any) => {
                            const isActive = conv._id === activeConvId;
                            const hasUnread = conv.unreadCount > 0;
                            return (
                                <div key={conv._id}
                                    className={`flex items-start gap-3 p-3 cursor-pointer border-b transition-colors ${isActive ? 'bg-primary/5 border-l-2 border-l-primary' :
                                            hasUnread ? 'bg-green-50/30 dark:bg-green-500/5 hover:bg-muted/50' :
                                                'hover:bg-muted/30'
                                        }`}
                                    onClick={() => setActiveConvId(conv._id)}>
                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                        {(conv.contactName || '?')[0].toUpperCase()}
                                    </div>
                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={`text-sm truncate ${hasUnread ? 'font-bold' : 'font-medium'}`}>
                                                {conv.contactName}
                                            </p>
                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                {conv.lastMessage?.sentAt ? new Date(conv.lastMessage.sentAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : ''}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            {conv.isPinned && <Pin className="h-2.5 w-2.5 text-blue-500" />}
                                            {conv.linkedPartyId && <Badge className="text-[8px] px-1 py-0 h-3.5 bg-blue-100 text-blue-700">Customer</Badge>}
                                            {conv.linkedLeadId && <Badge className="text-[8px] px-1 py-0 h-3.5 bg-purple-100 text-purple-700">Lead</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                                            {conv.lastMessage?.direction === 'OUTBOUND' && '✓ '}
                                            {conv.lastMessage?.text || 'No messages'}
                                        </p>
                                    </div>
                                    {/* Unread */}
                                    {hasUnread && (
                                        <span className="bg-green-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                            {conv.unreadCount}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* ════════════ MIDDLE PANEL: Chat Window ════════════ */}
            <div className="flex-1 flex flex-col min-w-0">
                {!activeConvId ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                        <MessageCircle className="h-16 w-16 mb-4 opacity-20" />
                        <p className="text-lg font-medium">Select a conversation</p>
                        <p className="text-sm">Choose a chat to start messaging</p>
                    </div>
                ) : (
                    <>
                        {/* Chat Header */}
                        <div className="h-14 border-b bg-card flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                    {(activeConv?.contactName || '?')[0].toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">{activeConv?.contactName}</p>
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                        <Phone className="h-2.5 w-2.5" /> {activeConv?.phone}
                                        <span className={`ml-1 w-1.5 h-1.5 rounded-full ${statusColors[activeConv?.status] || 'bg-gray-400'}`} />
                                        <span>{activeConv?.status}</span>
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Star" onClick={() => activeConvId && toggleStar(activeConvId)}>
                                    <Star className={`h-3.5 w-3.5 ${activeConv?.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Pin" onClick={() => activeConvId && togglePin(activeConvId)}>
                                    <Pin className={`h-3.5 w-3.5 ${activeConv?.isPinned ? 'text-blue-500' : ''}`} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Snooze" onClick={() => activeConvId && setStatus(activeConvId, 'SNOOZED')}>
                                    <BellOff className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" title="Close" onClick={() => activeConvId && setStatus(activeConvId, 'CLOSED')}>
                                    <Archive className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[url('/chat-bg.svg')] bg-repeat bg-[length:400px]"
                            style={{ backgroundColor: 'hsl(var(--muted) / 0.15)' }}>
                            {messages.map((msg: any) => {
                                const isOut = msg.direction === 'OUTBOUND';
                                const isNoteMsg = msg.isInternalNote;
                                return (
                                    <div key={msg._id} className={`flex ${isOut ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm ${isNoteMsg ? 'bg-amber-100 dark:bg-amber-500/20 border border-amber-300' :
                                                isOut ? 'bg-green-100 dark:bg-green-800/40 rounded-br-md' :
                                                    'bg-card border rounded-bl-md'
                                            }`}>
                                            {isNoteMsg && <p className="text-[9px] text-amber-600 font-bold mb-0.5">📝 Internal Note</p>}
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.body}</p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                {msg.sentByUserId?.name && (
                                                    <span className="text-[9px] text-muted-foreground">{msg.sentByUserId.name}</span>
                                                )}
                                                <span className="text-[9px] text-muted-foreground">
                                                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {isOut && !isNoteMsg && (
                                                    <span className="text-[9px]">
                                                        {msg.deliveryStatus === 'READ' ? '✓✓' : msg.deliveryStatus === 'DELIVERED' ? '✓✓' : '✓'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Compose */}
                        <div className="border-t bg-card p-3">
                            <div className="flex items-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8" title="Attach File">
                                    <Paperclip className="h-4 w-4" />
                                </Button>
                                <Button variant={isNote ? 'default' : 'ghost'} size="icon" className={`h-8 w-8 ${isNote ? 'bg-amber-500 hover:bg-amber-600' : ''}`}
                                    title="Internal Note" onClick={() => setIsNote(!isNote)}>
                                    <StickyNote className="h-4 w-4" />
                                </Button>
                                <div className="flex-1 relative">
                                    {isNote && (
                                        <div className="absolute -top-6 left-0 text-[10px] text-amber-600 font-bold">📝 Writing internal note (not sent to customer)</div>
                                    )}
                                    <textarea
                                        className={`w-full rounded-xl border px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 ${isNote ? 'border-amber-400 bg-amber-50 dark:bg-amber-500/10' : 'bg-muted/30'
                                            }`}
                                        rows={1}
                                        placeholder={isNote ? 'Write an internal note...' : 'Type a message...'}
                                        value={msgText}
                                        onChange={e => setMsgText(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <Button
                                    onClick={handleSend}
                                    disabled={!msgText.trim() || sendMutation.isPending}
                                    size="icon"
                                    className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700 shadow-lg"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ════════════ RIGHT PANEL: Customer Context ════════════ */}
            {activeConvId && ctx && (
                <div className="w-72 border-l flex-shrink-0 overflow-y-auto bg-card hidden lg:block">
                    <div className="p-4 border-b">
                        <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Customer Context</h3>
                        {ctx.party ? (
                            <div>
                                <p className="font-semibold text-sm">{ctx.party.name}</p>
                                <p className="text-xs text-muted-foreground">{ctx.party.address?.city || ''}</p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                    <Phone className="h-3 w-3" /> {ctx.party.phone}
                                </p>
                            </div>
                        ) : ctx.lead ? (
                            <div>
                                <p className="font-semibold text-sm">{ctx.lead.contactPerson || ctx.lead.companyName}</p>
                                <Badge className="text-[9px] mt-1 bg-purple-100 text-purple-700">Lead</Badge>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">No linked customer</p>
                        )}
                    </div>

                    {/* Financial Summary */}
                    <div className="p-4 border-b space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Outstanding</span>
                            <span className="text-sm font-bold text-red-600">{formatCurrency(ctx.outstanding || 0)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Risk Score</span>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${ctx.riskScore >= 70 ? 'bg-emerald-500' : ctx.riskScore >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                <span className="text-sm font-bold">{ctx.riskScore}</span>
                                <Badge variant="outline" className="text-[9px]">{ctx.creditGrade}</Badge>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Pending Quotes</span>
                            <span className="text-sm font-medium">{ctx.pendingQuotations}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Last Order</span>
                            <span className="text-xs">{ctx.lastOrderDate ? formatDate(ctx.lastOrderDate) : '—'}</span>
                        </div>
                    </div>

                    {/* Recent Challans */}
                    <div className="p-4 border-b">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recent Challans</h4>
                        {ctx.recentChallans?.length > 0 ? ctx.recentChallans.slice(0, 3).map((c: any) => (
                            <div key={c._id} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                                <span className="font-medium">{c.challanNumber}</span>
                                <span className="text-muted-foreground">{formatCurrency(c.totalAmount || 0)}</span>
                            </div>
                        )) : <p className="text-xs text-muted-foreground">None</p>}
                    </div>

                    {/* Recent Invoices */}
                    <div className="p-4 border-b">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Recent Invoices</h4>
                        {ctx.recentInvoices?.length > 0 ? ctx.recentInvoices.slice(0, 3).map((i: any) => (
                            <div key={i._id} className="flex items-center justify-between text-xs py-1 border-b last:border-0">
                                <span className="font-medium">{i.invoiceNumber}</span>
                                <div>
                                    <span className="text-muted-foreground">{formatCurrency(i.grandTotal || 0)}</span>
                                    <Badge variant={i.paymentStatus === 'PAID' ? 'default' : 'destructive'} className="text-[8px] ml-1">
                                        {i.paymentStatus}
                                    </Badge>
                                </div>
                            </div>
                        )) : <p className="text-xs text-muted-foreground">None</p>}
                    </div>

                    {/* Tags */}
                    <div className="p-4 border-b">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-1">
                            {ctx.tags?.map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                            ))}
                            {(!ctx.tags || ctx.tags.length === 0) && <p className="text-xs text-muted-foreground">No tags</p>}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="p-4">
                        <h4 className="text-[10px] font-bold text-muted-foreground uppercase mb-2">Quick Actions</h4>
                        <div className="grid grid-cols-2 gap-1.5">
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start">
                                <Sparkles className="mr-1 h-3 w-3" /> Create Lead
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start">
                                <FileText className="mr-1 h-3 w-3" /> New Quotation
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start">
                                <FileText className="mr-1 h-3 w-3" /> New Challan
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start">
                                <IndianRupee className="mr-1 h-3 w-3" /> Record Pay
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start">
                                <Clock className="mr-1 h-3 w-3" /> Follow Up
                            </Button>
                            <Button variant="outline" size="sm" className="h-7 text-[10px] justify-start text-red-600">
                                <Ban className="mr-1 h-3 w-3" /> Block
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
