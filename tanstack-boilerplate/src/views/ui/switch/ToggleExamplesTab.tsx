import { Switch } from "@/components/ui/Switch";
import { SettingsPanel } from "./SettingsPanel";

export function ToggleExamplesTab() {
  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Default</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Switch aria-label="Off example" data-testid="switch-default" />
          <Switch
            defaultChecked
            aria-label="On example"
            data-testid="switch-checked"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Disabled</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Switch disabled data-testid="switch-disabled" />
          <Switch disabled defaultChecked />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">With Label</h3>
        <Switch label="Enable notifications" data-testid="switch-labeled" />
      </section>

      <SettingsPanel />
    </div>
  );
}
