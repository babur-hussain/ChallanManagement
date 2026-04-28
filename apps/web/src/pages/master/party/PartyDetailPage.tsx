import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useParty, usePartyStatementWithParams } from '@/hooks/api/useParties';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@textilepro/shared';
import { ArrowLeft, Edit, MapPin, Phone, MessageSquare, Briefcase, FileText, Download } from 'lucide-react';
import { PartyModal } from './components/PartyModal';
import { Skeleton } from '@/components/ui/skeleton';
import { DataTable } from '@/components/shared/DataTable';

export function PartyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: party, isLoading } = useParty(id!);
  
  // Using current FY hardcoded date strings for statement (in real app, use a date picker)
  const today = new Date();
  const fyStart = new Date(today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1, 3, 1);
  const { data: statement, isLoading: isStatementLoading } = usePartyStatementWithParams(
    id!, 
    fyStart.toISOString(), 
    today.toISOString()
  );

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-40 w-full mb-6"/><Skeleton className="h-80 w-full" /></div>;
  }

  if (!party) {
    return <div className="p-8">Party not found</div>;
  }

  const statementColumns = [
    { key: 'date', header: 'Date', cell: (item: any) => formatDate(item.date) },
    { key: 'type', header: 'Type', cell: (item: any) => <span className="text-xs font-mono bg-muted px-1 py-0.5 rounded">{item.type}</span> },
    { key: 'description', header: 'Description', cell: (item: any) => item.description },
    { key: 'debit', header: 'Debit DR', align: 'right' as const, cell: (item: any) => item.debit ? formatCurrency(item.debit) : '-' },
    { key: 'credit', header: 'Credit CR', align: 'right' as const, cell: (item: any) => item.credit ? formatCurrency(item.credit) : '-' },
    { 
      key: 'balance', 
      header: 'Balance', 
      align: 'right' as const, 
      cell: (item: any) => <span className="font-medium">{formatCurrency(Math.abs(item.balance))} {item.balance >= 0 ? "DR" : "CR"}</span> 
    },
  ];

  return (
    <div className="container py-4 max-w-7xl animate-in fade-in-50">
      <Button variant="ghost" size="sm" onClick={() => navigate('/app/parties')} className="mb-4 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Parties
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{party.name}</h1>
            <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm font-bold tracking-wider">{party.shortCode}</span>
            <span className="bg-muted text-muted-foreground px-2 py-1 rounded text-xs capitalize">{party.partyType.toLowerCase()}</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {party.phone}</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {party.address.city}, {party.address.state}</span>
            {party.gstin && <span className="flex items-center gap-1"><Briefcase className="h-4 w-4" /> GST: {party.gstin}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {party.whatsapp && (
            <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => window.open(`https://wa.me/91${party.whatsapp}`)}>
              <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground uppercase">Outstanding Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${party.outstandingBalance > 0 ? 'text-destructive' : ''}`}>
              {formatCurrency(Math.abs(party.outstandingBalance))} {party.outstandingBalance >= 0 ? 'DR' : 'CR'}
            </div>
            {party.creditLimit > 0 && (
              <div className="mt-2 h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full ${party.creditUtilization > 90 ? 'bg-destructive' : 'bg-primary'}`} 
                  style={{ width: `${Math.min(party.creditUtilization, 100)}%` }} 
                />
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              {party.creditLimit > 0 ? `${party.creditUtilization}% of ${formatCurrency(party.creditLimit)} limit used` : 'No credit limit set'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Business Address</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{party.address.line1}</p>
            {party.address.line2 && <p>{party.address.line2}</p>}
            <p>{party.address.city}, {party.address.state} - {party.address.pincode}</p>
            {party.remarks && (
              <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-500 rounded-md text-xs">
                <strong>Note:</strong> {party.remarks}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Account Statement</h3>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" /> Download PDF
          </Button>
        </div>
        
        <div className="border rounded-lg bg-card">
          <DataTable
            data={statement?.transactions || []}
            columns={statementColumns}
            keyExtractor={(_, idx) => `trans-${idx}`}
            isLoading={isStatementLoading}
            emptyTitle="No transactions found"
            emptyDescription="There are no transactions in the current financial year."
          />
        </div>
      </div>

      <PartyModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        partyToEdit={party}
      />
    </div>
  );
}
