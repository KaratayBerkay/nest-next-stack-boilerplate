import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function StatsDashboardTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Stats Dashboard</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>Total Revenue</CardDescription>
            <CardTitle className="text-2xl">$45,231.89</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+20.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Subscriptions</CardDescription>
            <CardTitle className="text-2xl">+2,350</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="success">+180.1% from last month</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Active Users</CardDescription>
            <CardTitle className="text-2xl">+12,234</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="info">+19% from last month</Badge>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
