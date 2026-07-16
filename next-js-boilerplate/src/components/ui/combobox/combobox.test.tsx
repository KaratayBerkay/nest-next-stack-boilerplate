import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Combobox } from "./combobox";

vi.mock("@/hooks/useTheme", () => ({
  useTheme: () => ({ componentStyle: "default" as const }),
}));

const options = [
  { value: "apple", label: "Apple" },
  { value: "banana", label: "Banana" },
  { value: "cherry", label: "Cherry" },
];

describe("Combobox", () => {
  it("renders trigger with type=button", () => {
    render(<Combobox options={options} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("type")).toBe("button");
  });

  it("toggles aria-expanded on click", () => {
    render(<Combobox options={options} />);
    const trigger = screen.getByRole("combobox");

    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("has aria-haspopup=listbox and aria-controls", () => {
    render(<Combobox options={options} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-controls")).toBeTruthy();
  });

  it("closes on Escape and returns focus to trigger", () => {
    render(<Combobox options={options} />);
    const trigger = screen.getByRole("combobox");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on outside click", () => {
    render(
      <div>
        <div data-testid="outside">Outside</div>
        <Combobox options={options} />
      </div>,
    );
    const trigger = screen.getByRole("combobox");

    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("does not open when disabled", () => {
    render(<Combobox options={options} disabled />);
    const trigger = screen.getByRole("combobox");

    expect(trigger.getAttribute("disabled")).toBe("");
    fireEvent.click(trigger);
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("selects an option and closes", () => {
    const onValueChange = vi.fn();
    render(<Combobox options={options} onValueChange={onValueChange} />);
    const trigger = screen.getByRole("combobox");

    fireEvent.click(trigger);
    fireEvent.click(screen.getByText("Banana"));

    expect(onValueChange).toHaveBeenCalledWith("banana");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
  });

  it("renders custom search placeholder and empty-state copy (A10)", () => {
    render(
      <Combobox
        options={options}
        searchPlaceholder="Ara..."
        emptyTitle="Sonuç yok"
        emptyDescription="Eşleşen öğe bulunamadı."
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));

    const input = screen.getByPlaceholderText("Ara...");
    fireEvent.change(input, { target: { value: "zzz" } });

    expect(screen.getByText("Sonuç yok")).toBeDefined();
    expect(screen.getByText("Eşleşen öğe bulunamadı.")).toBeDefined();
  });
});
