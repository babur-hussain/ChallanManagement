import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const WhiteLabelConfig = () => {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">White-Label Configurations</h1>
                <p className="text-muted-foreground">Deploy this platform on your own domain with your branding.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Domain Routing</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Custom CNAME Domain</label>
                            <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="erp.sharmapartners.com" />
                            <p className="text-xs text-muted-foreground">Point your DNS CNAME to hosting.textilepro.in</p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">App Title Name</label>
                            <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="Sharma ERP OS" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Theme Setup</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Primary Brand Color (Hex)</label>
                            <div className="flex gap-2">
                                <div className="w-10 h-10 rounded border" style={{ backgroundColor: '#1e3a8a' }}></div>
                                <input type="text" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" defaultValue="#1e3a8a" />
                            </div>
                        </div>
                        <div className="space-y-2 py-4">
                            <Button className="w-full">Deploy Theme Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
