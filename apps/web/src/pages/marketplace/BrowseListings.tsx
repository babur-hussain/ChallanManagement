import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, MapPin, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const BrowseListings = () => {
    const [query, setQuery] = useState('');

    // Mock search results
    const results = [
        { id: 1, title: 'Premium Georgette Plain', businessName: 'Surat Textiles Ltd', city: 'Surat', trustScore: 92, price: '120.00', stock: 'IN_STOCK', tags: ['Georgette', 'Dyed'] },
        { id: 2, title: 'Cotton Silk Blend Fabric', businessName: 'Raj Traders', city: 'Ahmedabad', trustScore: 88, price: '---', stock: 'LIMITED', tags: ['Cotton', 'Silk'] },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Browse Listings</h1>
                <p className="text-muted-foreground">Find the perfect fabric globally.</p>
            </div>

            <div className="flex gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by quality, category, or supplier..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-9 bg-card"
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" /> Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                {results.map((r) => (
                    <Card key={r.id} className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer">
                        <div className="h-48 bg-secondary/50 relative overflow-hidden">
                            <img src={`https://via.placeholder.com/300x200?text=${r.title.split(' ').join('+')}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt="fabric" />
                            {r.trustScore > 90 && (
                                <Badge className="absolute top-2 right-2 bg-success text-white shadow-sm flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3" /> Top Supplier
                                </Badge>
                            )}
                        </div>
                        <CardContent className="p-4">
                            <h3 className="font-semibold text-lg line-clamp-1">{r.title}</h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3 h-3" /> {r.city} • {r.businessName}
                            </div>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                {r.tags.map(t => <Badge variant="secondary" key={t} className="text-xs">{t}</Badge>)}
                            </div>
                            <div className="mt-4 pt-4 border-t flex justify-between items-center">
                                <div className="font-semibold text-primary">₹{r.price} <span className="text-xs text-muted-foreground font-normal">/ meter</span></div>
                                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">Inquire</Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};
