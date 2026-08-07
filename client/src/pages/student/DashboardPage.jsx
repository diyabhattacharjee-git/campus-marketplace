import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Placeholder — real per-role widgets (stats, recent bids, price alerts)
// are built in Step 14: Analytics & Price Trend Graphs, once there is
// real data from the earlier feature steps to show.
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          This is a placeholder — real widgets land as each feature is built.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {['Active listings', 'Open bid requests', 'Unread messages'].map((label) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-3xl font-semibold">—</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
