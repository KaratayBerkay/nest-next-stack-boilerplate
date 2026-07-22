import { IconAdjustmentsHorizontal } from "@tabler/icons-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/Collapsible";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Chevron } from "@/views/ui/collapsible/Chevron";

export function AdvancedSettingsTab() {
  return (
    <form
      className="bg-surface border-border flex max-w-md flex-col gap-4 rounded-lg border p-5"
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="collapsible-project-name"
          className="text-fg text-sm font-medium"
        >
          Project name
        </label>
        <Input id="collapsible-project-name" defaultValue="marketing-site" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="collapsible-project-url"
          className="text-fg text-sm font-medium"
        >
          Production URL
        </label>
        <Input
          id="collapsible-project-url"
          type="url"
          defaultValue="https://example.com"
        />
      </div>

      <Collapsible>
        <CollapsibleTrigger className="group text-muted hover:text-fg flex items-center gap-2 rounded-md py-1 text-sm font-medium">
          <IconAdjustmentsHorizontal className="size-4" aria-hidden="true" />
          Advanced options
          <Chevron />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="flex flex-col gap-4 pt-3">
            <Switch label="Enable edge caching" defaultChecked />
            <Switch label="Verbose build logs" />
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="collapsible-webhook"
                className="text-fg text-sm font-medium"
              >
                Deploy webhook
              </label>
              <Input
                id="collapsible-webhook"
                type="url"
                placeholder="https://hooks.example.com/deploy"
                description="Called after every successful deploy."
              />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      <div>
        <Button size="sm" type="submit">
          Save changes
        </Button>
      </div>
    </form>
  );
}
