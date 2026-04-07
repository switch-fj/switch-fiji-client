import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@switch-fiji/ui";

const stats = [
  { label: "Open invoices", value: "12" },
  { label: "Pending payouts", value: "4" },
  { label: "Payments today", value: "$8,240" },
  { label: "Cashflow", value: "+$2,180" },
];

export default function DashboardView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Finance overview</h1>
        <p className="text-sm text-muted-foreground">
          Track invoices, payouts, and payments at a glance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-xl">{stat.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>
            Latest finance updates for your team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>Invoice #3942 paid by Oceanic Ltd.</li>
            <li>Refund issued for payment #8821.</li>
            <li>Payout request for $1,200 is pending approval.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
