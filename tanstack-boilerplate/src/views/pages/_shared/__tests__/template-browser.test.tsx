import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import en from "@/generated/i18n-messages-en.json";
import { TemplateBrowser } from "../TemplateBrowser";
import { tokenizeTsx } from "../highlight-tsx";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";

const replaceSpy = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceSpy }),
  usePathname: () => "/v1/en/pages/about",
  useParams: () => ({ lang: "en" }),
}));
vi.mock("@/lib/i18n/MessagesProvider", () => ({
  useMessages: () => (en as Record<string, unknown>).pages,
}));
vi.mock("@/hooks/useComponentVariant", () => ({
  useComponentVariant: (variant?: string) => variant ?? "default",
}));

const browserMessages = (
  (en as Record<string, unknown>).pages as {
    browser: Record<string, string>;
  }
).browser;

function makeExamples(): UIExample[] {
  return [
    {
      id: "alpha",
      title: "Alpha Split",
      description: "A split layout",
      render: () => <div data-testid="render-alpha">alpha body</div>,
    },
    {
      id: "beta",
      title: "Beta Grid",
      description: "A grid layout",
      render: () => <div data-testid="render-beta">beta body</div>,
    },
    {
      id: "gamma",
      title: "Gamma Bento",
      description: "A bento layout",
      render: () => <div data-testid="render-gamma">gamma body</div>,
    },
  ];
}

function renderBrowser(
  props: Partial<Parameters<typeof TemplateBrowser>[0]> = {},
) {
  return render(
    <TemplateBrowser
      title="About"
      intro="About templates"
      examples={makeExamples()}
      category="about"
      {...props}
    />,
  );
}

beforeEach(() => {
  replaceSpy.mockClear();
});

describe("TemplateBrowser grid view", () => {
  it("shows one card per variant with the localized count", () => {
    renderBrowser();
    expect(screen.getByText("Alpha Split")).toBeTruthy();
    expect(screen.getByText("Beta Grid")).toBeTruthy();
    expect(screen.getByText("Gamma Bento")).toBeTruthy();
    expect(
      screen.getByText(browserMessages.countLabel.replace("{count}", "3")),
    ).toBeTruthy();
  });

  it("filters cards by search and can clear an empty result", () => {
    renderBrowser();
    const input = screen.getByPlaceholderText(
      browserMessages.searchPlaceholder,
    );
    fireEvent.change(input, { target: { value: "bento" } });
    expect(screen.queryByText("Alpha Split")).toBeNull();
    expect(screen.getByText("Gamma Bento")).toBeTruthy();

    fireEvent.change(input, { target: { value: "zzz" } });
    expect(screen.getByText(browserMessages.noResults)).toBeTruthy();
    fireEvent.click(screen.getByText(browserMessages.clearSearch));
    expect(screen.getByText("Alpha Split")).toBeTruthy();
  });

  it("opens the detail view and updates the URL when a card is clicked", () => {
    renderBrowser();
    fireEvent.click(screen.getByText("Beta Grid"));
    expect(screen.getByTestId("render-beta")).toBeTruthy();
    expect(
      screen.getByText(
        browserMessages.positionLabel
          .replace("{current}", "2")
          .replace("{total}", "3"),
      ),
    ).toBeTruthy();
    expect(replaceSpy).toHaveBeenCalledWith("/v1/en/pages/about?tab=beta", {
      scroll: false,
    });
  });
});

describe("TemplateBrowser detail view", () => {
  it("deep-links straight into a variant via initialTab", () => {
    renderBrowser({ initialTab: "gamma" });
    expect(screen.getByTestId("render-gamma")).toBeTruthy();
  });

  it("falls back to the grid for an unknown initialTab", () => {
    renderBrowser({ initialTab: "nope" });
    expect(screen.getByText("Alpha Split")).toBeTruthy();
  });

  it("navigates with prev/next and disables them at the edges", () => {
    renderBrowser({ initialTab: "alpha" });
    const prev = screen.getByRole("button", { name: browserMessages.previous });
    const next = screen.getByRole("button", { name: browserMessages.next });
    expect((prev as HTMLButtonElement).disabled).toBe(true);

    fireEvent.click(next);
    expect(screen.getByTestId("render-beta")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: browserMessages.next }));
    expect(screen.getByTestId("render-gamma")).toBeTruthy();
    expect(
      (
        screen.getByRole("button", {
          name: browserMessages.next,
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(true);
  });

  it("returns to the grid via the back control", () => {
    renderBrowser({ initialTab: "beta" });
    fireEvent.click(screen.getByText(browserMessages.backToGrid));
    expect(screen.getByText("Alpha Split")).toBeTruthy();
    expect(replaceSpy).toHaveBeenLastCalledWith("/v1/en/pages/about", {
      scroll: false,
    });
  });
});

describe("TemplateBrowser full-screen overlay", () => {
  it("opens via initialFull, renders into a portal, and closes on Escape", () => {
    renderBrowser({ initialTab: "alpha", initialFull: true });
    expect(
      screen.getByRole("button", { name: browserMessages.exitFullScreen }),
    ).toBeTruthy();

    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("button", { name: browserMessages.exitFullScreen }),
    ).toBeNull();
    expect(replaceSpy).toHaveBeenLastCalledWith(
      "/v1/en/pages/about?tab=alpha",
      {
        scroll: false,
      },
    );
  });
});

describe("tokenizeTsx", () => {
  it("classifies comments, strings, keywords, and numbers", () => {
    const code = `// note\nconst n = 42;\nexport function f() {\n  return "hi";\n}`;
    const tokens = tokenizeTsx(code);
    const byType = (type: string) =>
      tokens.filter((t) => t.type === type).map((t) => t.text);
    expect(byType("comment")).toEqual(["// note"]);
    expect(byType("string")).toEqual(['"hi"']);
    expect(byType("keyword")).toContain("const");
    expect(byType("keyword")).toContain("export");
    expect(byType("number")).toEqual(["42"]);
  });

  it("reassembles to the exact original source", () => {
    const code = 'const s = `a ${"b"} c`; /* block */ let x = 1.5;';
    expect(
      tokenizeTsx(code)
        .map((t) => t.text)
        .join(""),
    ).toBe(code);
  });
});
