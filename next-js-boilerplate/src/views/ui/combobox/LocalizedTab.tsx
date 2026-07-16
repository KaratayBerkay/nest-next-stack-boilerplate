import { useState } from "react";
import { Combobox } from "@/components/ui/Combobox";
import { getLabel } from "./helpers";
import { cities } from "./data";

export function LocalizedTab() {
  const [city, setCity] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <section className="flex flex-col gap-3">
        <h3 className="text-lg font-semibold">Localized strings</h3>
        <p className="text-muted text-sm">
          Every built-in string is a prop: <code>placeholder</code>,{" "}
          <code>searchPlaceholder</code>, <code>emptyTitle</code>,{" "}
          <code>emptyDescription</code>.
        </p>
        <Combobox
          options={cities}
          value={city}
          onValueChange={setCity}
          placeholder="Şehir seçin..."
          searchPlaceholder="Şehir ara..."
          emptyTitle="Sonuç yok"
          emptyDescription="Aramanızla eşleşen şehir bulunamadı."
          className="max-w-sm"
        />
        {city && (
          <div className="bg-surface rounded border border-border px-3 py-2">
            <span className="text-sm">
              Selected: <strong>{getLabel(city, cities)}</strong>
            </span>
          </div>
        )}
      </section>
    </div>
  );
}
