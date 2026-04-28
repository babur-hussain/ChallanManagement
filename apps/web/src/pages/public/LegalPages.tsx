import React from 'react';

export const LegalPage = ({ title, lastUpdated }: { title: string, lastUpdated: string }) => {
    return (
        <div className="py-24 max-w-4xl mx-auto px-4 prose prose-slate">
            <h1>{title}</h1>
            <p className="text-sm text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>

            <p>Welcome to TextilePro OS. We are committed to protecting your privacy and ensuring your data falls under strict compliance pipelines.</p>

            <h3>1. Data Processing Agreement (DPA)</h3>
            <p>TextilePro acts as a data processor. Businesses act as the data controller regarding customer ledgers, AI OCR inputs, and whatsapp sync templates.</p>

            <h3>2. Log Retention & Security</h3>
            <p>We log IP addresses of all Maker/Checker actions under ISO Standards. Audit logs are preserved for 7 years digitally to comply with Indian GST Council regulations.</p>

            <h3>3. Refund Policy</h3>
            <p>Due to the nature of B2B provisioning limits (e.g. AI OCR consumption), all annual and monthly subscription payments are strictly non-refundable.</p>

            <div className="mt-12 p-4 bg-muted rounded-lg text-sm">
                <p>For DPO contact or Data Export requests: grievance@textilepro.in</p>
            </div>
        </div>
    )
}
