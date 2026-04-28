import { useState } from 'react';
import { Search, Filter, Folder, File, Download, ExternalLink } from 'lucide-react';

export function VaultPage() {
    const [query, setQuery] = useState('');

    return (
        <div className="flex flex-col h-full space-y-4">
            <div>
                <h1 className="text-2xl font-bold">Document Vault</h1>
                <p className="text-muted-foreground mt-1 text-sm">Search through all your historical papers, bills, and images.</p>
            </div>

            <div className="flex gap-2 relative">
                <Search className="w-5 h-5 absolute left-3 top-3 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search by party name, challan no, GSTIN, amount, quality..."
                    className="flex-1 border rounded-lg pl-10 pr-4 py-3 shadow-sm focus:ring-1"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                />
                <button className="px-4 border rounded-lg bg-background hover:bg-muted font-medium text-sm flex items-center gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </button>
                <button className="px-6 bg-foreground text-background font-medium rounded-lg text-sm hover:bg-foreground/90">
                    Search Full Text
                </button>
            </div>

            <div className="flex-1 border rounded-xl bg-card overflow-hidden grid grid-cols-[200px_1fr]">
                <div className="border-r bg-muted/20 p-4">
                    <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Categories</h3>
                    <ul className="space-y-1 text-sm">
                        <li className="px-2 py-1.5 bg-primary/10 text-primary font-medium rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> All Documents (2,430)</li>
                        <li className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> Challans (890)</li>
                        <li className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> Invoices (540)</li>
                        <li className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> Payments (730)</li>
                        <li className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> Visiting Cards (182)</li>
                        <li className="px-2 py-1.5 hover:bg-muted rounded cursor-pointer flex items-center gap-2"><Folder className="w-4 h-4" /> Others (88)</li>
                    </ul>
                </div>

                <div className="p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max overflow-y-auto">
                    {/* Mock search results */}
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="border rounded-lg p-3 hover:shadow-md transition-shadow group flex flex-col bg-background relative cursor-pointer">
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-1.5 bg-white/90 shadow rounded border hover:text-primary"><Download className="w-3 h-3" /></button>
                                <button className="p-1.5 bg-white/90 shadow rounded border hover:text-primary"><ExternalLink className="w-3 h-3" /></button>
                            </div>
                            <div className="aspect-[3/4] bg-muted/50 rounded-md mb-3 flex flex-col items-center justify-center relative overflow-hidden">
                                <File className="w-10 h-10 text-muted-foreground/30 mb-2" />
                                <span className="text-xs font-medium text-muted-foreground bg-white px-2 py-0.5 rounded shadow-sm border border-neutral-100">PDF</span>
                            </div>
                            <div className="mt-auto">
                                <div className="font-medium text-sm truncate" title="Sree_Ram_Challan_2023.pdf">Sree_Ram_Challan_2023.pdf</div>
                                <div className="text-[10px] text-muted-foreground mt-1 flex justify-between">
                                    <span>Oct 25, 2023</span>
                                    <span>450 KB</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
