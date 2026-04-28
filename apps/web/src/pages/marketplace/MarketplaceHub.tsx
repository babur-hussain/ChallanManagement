import React, { useState } from 'react';
import { Store, Globe, Search, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const MarketplaceHub = () => {
    const navigate = useNavigate();
    const [networkMode, setNetworkMode] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Marketplace Hub</h1>
                    <p className="text-muted-foreground mt-1">
                        Discover suppliers, connect with buyers, and grow your textile network.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-secondary/30 px-4 py-2 rounded-xl">
                    <span className="font-medium text-sm">Network Mode:</span>
                    <Button
                        variant={networkMode ? 'default' : 'outline'}
                        onClick={() => setNetworkMode(!networkMode)}
                        className="w-24 transition-colors"
                    >
                        {networkMode ? 'Public' : 'Private'}
                    </Button>
                </div>
            </div>

            {!networkMode && (
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1">
                        <h2 className="text-xl font-bold mb-2">Grow your business with TextilePro Network</h2>
                        <p className="text-muted-foreground mb-4">Turn on Public Network mode to let buyers find you and inquire about your fabrics automatically.</p>
                        <Button onClick={() => setNetworkMode(true)}>Enable Network Mode</Button>
                    </div>
                    <Globe className="w-32 h-32 text-primary opacity-20" />
                </div>
            )}

            {/* Navigation Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-primary" onClick={() => navigate('/app/marketplace/browse')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Search className="w-5 h-5 text-primary" /> Browse Listings</CardTitle>
                        <CardDescription>Search the global fabric catalog.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-success" onClick={() => navigate('/app/marketplace/inquiries')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-success" /> Inquiries Inbox</CardTitle>
                        <CardDescription>Manage incoming requests and negotiations.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-warning" onClick={() => navigate('/app/marketplace/my-listings')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5 text-warning" /> My Listings</CardTitle>
                        <CardDescription>Manage your inventory on the marketplace.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/marketplace/profile')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5 text-muted-foreground" /> Public Profile</CardTitle>
                        <CardDescription>Edit your public store appearance.</CardDescription>
                    </CardHeader>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate('/app/marketplace/buyers')}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-muted-foreground" /> Recommended Buyers</CardTitle>
                        <CardDescription>See suggested matches using AI.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
};
