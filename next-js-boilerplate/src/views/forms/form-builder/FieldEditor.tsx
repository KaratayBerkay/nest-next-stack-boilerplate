import { FIELD_TYPES } from "@/types/forms/BuilderField-types";
import type { BuilderField } from "@/types/forms/BuilderField-types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Checkbox } from "@/components/ui/Checkbox";
import type { FieldEditorProps } from "@/types/views/forms/FieldEditor-types";

export function FieldEditor({
  field,
  idx,
  fieldsLength,
  onMoveUp,
  onMoveDown,
  onRemove,
  onUpdate,
  t,
}: FieldEditorProps) {
  return (
    <div className="surface border-border flex flex-col gap-2 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">
          {field.label || t.formBuilder.untitledField}
        </span>
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="ghost"
            disabled={idx === 0}
            onClick={() => onMoveUp(idx)}
          >
            {t.formBuilder.moveUp}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={idx >= fieldsLength - 1}
            onClick={() => onMoveDown(idx)}
          >
            {t.formBuilder.moveDown}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRemove(field.id)}
          >
            {t.formBuilder.removeField}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xxs text-muted">{t.formBuilder.fieldType}</span>
          <Dropdown
            options={FIELD_TYPES}
            value={field.type}
            onChange={(value) =>
              onUpdate(field.id, {
                type: value as BuilderField["type"],
              })
            }
          />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xxs text-muted">
            {t.formBuilder.fieldLabel}
          </span>
          <Input
            className="text-xs"
            value={field.label}
            onChange={(e) => onUpdate(field.id, { label: e.target.value })}
          />
        </div>
      </div>
      {field.type === "select" && (
        <div className="flex flex-col gap-1">
          <span className="text-xxs text-muted">
            {t.formBuilder.fieldOptions}
          </span>
          <Input
            className="text-xs"
            placeholder={t.formBuilder.optionsPlaceholder}
            value={field.options.join(", ")}
            onChange={(e) =>
              onUpdate(field.id, {
                options: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
          />
        </div>
      )}
      <label className="text-xxs flex items-center gap-2">
        <Checkbox
          checked={field.required}
          onChange={(e) => onUpdate(field.id, { required: e.target.checked })}
        />
        {t.formBuilder.fieldRequired}
      </label>
    </div>
  );
}
