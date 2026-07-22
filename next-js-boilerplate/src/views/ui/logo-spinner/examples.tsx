import { RouteTransitionTab } from "./RouteTransitionTab";
import { DataPaneTab } from "./DataPaneTab";
import { SplashTab } from "./SplashTab";
import type { UIExample } from "@/types/ui/ExampleTabs-types";

export const examples: UIExample[] = [
  {
    id: "route-transition",
    title: "Route Transition",
    description:
      "Mock page shell that swaps content behind a centered LogoSpinner overlay on button click.",
    render: () => <RouteTransitionTab />,
  },
  {
    id: "data-pane",
    title: "Data Pane",
    description: "Skeleton rows → LogoSpinner → loaded list sequence.",
    render: () => <DataPaneTab />,
  },
  {
    id: "splash",
    title: "Splash",
    description: "Full-pane brand splash with fade-out.",
    render: () => <SplashTab />,
  },
];
