"use client";

import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { NativeSelect } from "@/components/ui/NativeSelect";
import { Label } from "@/components/ui/Label";

const FIELD_STYLES = "flex flex-col gap-1";

function StateCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="surface flex flex-col gap-2 rounded-lg border border-border p-4">
      <p className="text-xxs text-muted uppercase tracking-wider">{label}</p>
      {children}
    </div>
  );
}

function renderFieldStates() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StateCard label="Default">
        <Input placeholder="Default input" />
      </StateCard>
      <StateCard label="Filled">
        <Input value="Some value" onChange={() => {}} />
      </StateCard>
      <StateCard label="Error">
        <Input value="Bad value" onChange={() => {}} className="border-error" />
        <p className="text-xs text-error">This field has an error</p>
      </StateCard>
      <StateCard label="Warning">
        <Input value="Suspicious" onChange={() => {}} className="border-warning" />
        <p className="text-xs text-warning">This value looks unusual</p>
      </StateCard>
      <StateCard label="Disabled">
        <Input disabled value="Cannot edit" />
      </StateCard>
      <StateCard label="Loading / Validating">
        <div className="flex items-center gap-2">
          <Input value="checking…" onChange={() => {}} />
          <span className="text-muted inline-block size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      </StateCard>
      <StateCard label="Read-only">
        <Input value="Read-only value" readOnly />
      </StateCard>
      <StateCard label="Required">
        <Label required>Required field</Label>
        <Input placeholder="This is required" />
      </StateCard>
    </div>
  );
}

function ValidationModeSection() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs text-muted">
        The same 3-field form mounted with three different validation strategies.
      </p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <StateCard label="Eager (onChange)">
          <p className="text-xxs text-muted">Validates on every keystroke</p>
          <Input placeholder="Type here…" />
          <NativeSelect>
            <option>Option A</option>
            <option>Option B</option>
          </NativeSelect>
          <Textarea placeholder="More text…" />
        </StateCard>
        <StateCard label="Classic (onBlur)">
          <p className="text-xxs text-muted">Validates only on blur</p>
          <Input placeholder="Tab away to validate…" />
          <NativeSelect>
            <option>Option A</option>
            <option>Option B</option>
          </NativeSelect>
          <Textarea placeholder="Tab away…" />
        </StateCard>
        <StateCard label="Dynamic (reward early, punish late)">
          <p className="text-xxs text-muted">Quiet until first submit, then live</p>
          <Input placeholder="Submit first, then live validation" />
          <NativeSelect>
            <option>Option A</option>
            <option>Option B</option>
          </NativeSelect>
          <Textarea placeholder="Same here" />
        </StateCard>
      </div>
    </div>
  );
}

function LinkedFieldsSection() {
  return (
    <div className="surface flex flex-col gap-4 rounded-lg border border-border p-4">
      <p className="text-xs font-medium">Linked Fields — Confirm Password</p>
      <p className="text-xxs text-muted">
        Changing the password field re-validates the confirm field. Uses <code>onChangeListenTo</code>.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={FIELD_STYLES}>
          <Label>Password</Label>
          <Input type="password" placeholder="Enter password" />
        </div>
        <div className={FIELD_STYLES}>
          <Label>Confirm Password</Label>
          <Input type="password" placeholder="Re-enter password" />
        </div>
      </div>
    </div>
  );
}

function ProgrammaticMetaSection() {
  return (
    <div className="surface flex flex-col gap-4 rounded-lg border border-border p-4">
      <p className="text-xs font-medium">Programmatic Field Meta</p>
      <p className="text-xxs text-muted">
        Setting meta via <code>field.setMeta</code> — warning severity, custom error messages.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className={FIELD_STYLES}>
          <Label>Custom Warning</Label>
          <Input value="Edge case" onChange={() => {}} className="border-warning" />
          <p className="text-xs text-warning">This value is unusual for your account</p>
        </div>
        <div className={FIELD_STYLES}>
          <Label>Custom Error</Label>
          <Input value="Bad" onChange={() => {}} className="border-error" />
          <p className="text-xs text-error">Server rejected this value</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <StateCard label="aria-invalid">
          <Input aria-invalid placeholder="aria-invalid on this" />
        </StateCard>
        <StateCard label="aria-describedby">
          <Input aria-describedby="desc-1" placeholder="Linked to description" />
          <p id="desc-1" className="text-xxs text-muted">Description text via aria-describedby</p>
        </StateCard>
      </div>
    </div>
  );
}

export default function FieldStatesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-sm font-semibold">Field States & Validation Modes</h2>
        <p className="text-muted text-xs">Every client-side state per field type</p>
      </div>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Field States</h3>
        {renderFieldStates()}
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Validation Modes</h3>
        <ValidationModeSection />
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Linked Fields</h3>
        <LinkedFieldsSection />
      </section>

      <section>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">Programmatic Meta & A11y</h3>
        <ProgrammaticMetaSection />
      </section>
    </div>
  );
}
