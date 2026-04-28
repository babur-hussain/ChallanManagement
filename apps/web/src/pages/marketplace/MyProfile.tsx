import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export const MyProfile = () => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Public Profile</h1>
                <p className="text-muted-foreground">Manage how your business appears to buyers on the network.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Business Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <Input defaultValue="Surat Textiles Ltd" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Business Type</label>
                            <Input defaultValue="MANUFACTURER" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">City</label>
                            <Input defaultValue="Surat" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Years in Business</label>
                            <Input defaultValue="15" type="number" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">About Us</label>
                        <Textarea rows={4} defaultValue="We specialize in high quality georgette and chiffon fabrics, serving exporters worldwide." />
                    </div>

                    <Button className="mt-4">Save Profile</Button>
                </CardContent>
            </Card>
        </div>
    );
};
