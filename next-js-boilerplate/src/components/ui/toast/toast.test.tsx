import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ToastProvider, ToastViewport, useToast } from "./index";

function Trigger({ action }: { action?: React.ReactNode }) {
  const { toast } = useToast();
  return (
    <button
      data-testid="trigger"
      onClick={() =>
        toast({
          title: "Hello",
          description: "World",
          action,
        })
      }
    >
      Show
    </button>
  );
}

function DestructiveTrigger() {
  const { toast } = useToast();
  return (
    <button
      data-testid="destructive-trigger"
      onClick={() =>
        toast({
          title: "Fatal Error",
          description: "Sticky",
          variant: "destructive",
        })
      }
    >
      Error
    </button>
  );
}

function renderToast(action?: React.ReactNode) {
  return render(
    <ToastProvider>
      <Trigger action={action} />
      <ToastViewport />
    </ToastProvider>,
  );
}

function renderDestructiveToast() {
  return render(
    <ToastProvider>
      <DestructiveTrigger />
      <ToastViewport />
    </ToastProvider>,
  );
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Toast", () => {
  it("renders a toast when triggered", () => {
    renderToast();
    fireEvent.click(screen.getByTestId("trigger"));
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByText("World")).toBeTruthy();
  });

  it("auto-dismisses after default duration", () => {
    renderToast();
    fireEvent.click(screen.getByTestId("trigger"));

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText("Hello")).toBeNull();
  });

  it("dismisses on close button click", () => {
    renderToast();
    fireEvent.click(screen.getByTestId("trigger"));

    const closeBtn = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeBtn);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByText("Hello")).toBeNull();
  });

  it("renders a destructive toast with sticky (Infinity) duration", () => {
    renderDestructiveToast();
    fireEvent.click(screen.getByTestId("destructive-trigger"));
    expect(screen.queryByText("Fatal Error")).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.queryByText("Fatal Error")).toBeTruthy();
  });

  it("caps visible toasts at 3", () => {
    function MultiTrigger() {
      const { toast } = useToast();
      return (
        <div>
          <button data-testid="multi" onClick={() => toast({ title: "Toast" })}>
            Add
          </button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <MultiTrigger />
        <ToastViewport />
      </ToastProvider>,
    );

    const btn = screen.getByTestId("multi");
    for (let i = 0; i < 5; i++) {
      fireEvent.click(btn);
    }

    expect(screen.getAllByText("Toast").length).toBe(3);
  });

  it("caps visible stack at 3 when queued items exist and one dismisses", () => {
    function MultiTrigger() {
      const { toast } = useToast();
      return (
        <div>
          <button data-testid="multi" onClick={() => toast({ title: "Toast" })}>
            Add
          </button>
        </div>
      );
    }

    render(
      <ToastProvider>
        <MultiTrigger />
        <ToastViewport />
      </ToastProvider>,
    );

    const btn = screen.getByTestId("multi");
    for (let i = 0; i < 5; i++) {
      fireEvent.click(btn);
    }

    expect(screen.getAllByText("Toast").length).toBe(3);

    const closeBtns = screen.getAllByRole("button", { name: /close/i });
    fireEvent.click(closeBtns[0]);

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      vi.advanceTimersByTime(0);
    });

    expect(screen.getAllByText("Toast").length).toBe(3);
  });

  it("uses role=alert for destructive toasts", () => {
    renderDestructiveToast();
    fireEvent.click(screen.getByTestId("destructive-trigger"));
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toContain("Fatal Error");
  });

  it("viewport has a permanent role=status region", () => {
    renderToast();
    expect(screen.getByRole("status")).toBeTruthy();
  });
});
