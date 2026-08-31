import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import {
  RootErrorComponent,
  RootNotFoundComponent,
  RootPendingComponent,
} from "@/routes/-shell/root-defaults";

export function getRouter() {
  return createRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: false,
    defaultPendingComponent: RootPendingComponent,
    defaultErrorComponent: RootErrorComponent,
    defaultNotFoundComponent: RootNotFoundComponent,
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
