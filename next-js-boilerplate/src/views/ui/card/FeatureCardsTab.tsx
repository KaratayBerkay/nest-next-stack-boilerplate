import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/Card";

export function FeatureCardsTab() {
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Feature Cards</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Speed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Blazing fast performance with optimized rendering and lazy
              loading.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Enterprise-grade security with encryption at rest and in transit.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Scalability</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted text-sm">
              Scales effortlessly from small projects to enterprise
              applications.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
