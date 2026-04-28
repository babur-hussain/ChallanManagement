import React from 'react';
import { Plus, Edit2, Eye, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export const MyListings = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Listings</h1>
                    <p className="text-muted-foreground">Manage your products visible on the marketplace.</p>
                </div>
                <Button className="gap-2"><Plus className="w-4 h-4" /> Create Listing</Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow">
                    <div className="h-40 bg-secondary/30 w-full flex items-center justify-center border-b">
                        <span className="text-muted-foreground text-sm">Image Placeholder</span>
                    </div>
                    <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold">Premium Georgette</h3>
                            <Badge variant="success">Active</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">LST-98213-1</p>
                        <div className="flex justify-between text-sm mb-4">
                            <div className="flex flex-col items-center"><span className="font-semibold">1.2k</span> <span className="text-xs text-muted-foreground"><Eye className="inline w-3 h-3 mr-1" />Views</span></div>
                            <div className="flex flex-col items-center"><span className="font-semibold">45</span> <span className="text-xs text-muted-foreground"><TrendingUp className="inline w-3 h-3 mr-1" />Inquiries</span></div>
                        </div>
                        <Button variant="outline" className="w-full gap-2"><Edit2 className="w-4 h-4" /> Edit Listing</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
