import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/Card";
import { variantDescriptions, variantUseCases } from "./variant-gallery-data";
import type { VariantCardProps } from "@/types/views/ui/CardDemo-types";

export function VariantCard({ variant }: VariantCardProps) {
  return (
    <Card key={variant} variant={variant}>
      <CardHeader>
        <CardTitle className="text-sm capitalize">{variant}</CardTitle>
        <CardDescription>{variantDescriptions[variant]}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted text-xs">
          Use this variant when you need to {variantUseCases[variant]}.
        </p>
      </CardContent>
    </Card>
  );
}
