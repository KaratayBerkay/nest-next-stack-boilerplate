"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { MeshDriftHeroShader } from "./MeshDriftHeroShader";
import { AuroraBlendBannerShader } from "./AuroraBlendBannerShader";
import { GrainGradientPanelShader } from "./GrainGradientPanelShader";
import { ConicRingGlowShader } from "./ConicRingGlowShader";
import { PulseSpotlightShader } from "./PulseSpotlightShader";
import { WaveStripeBackdropShader } from "./WaveStripeBackdropShader";
import { KaleidoscopeSwirlShader } from "./KaleidoscopeSwirlShader";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";
import type { PagesWithShaderMessages } from "@/types/pages/shader/ShaderMessages-types";

export default function ShaderPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages") as unknown as PagesWithShaderMessages & {
    examples: {
      shaderTitle: string;
      shaderDescription: string;
    };
  };
  const t = m.shader;

  const examples: UIExample[] = [
    {
      id: "shader-1",
      title: t.shader1TabTitle,
      description: t.shader1TabDescription,
      render: () => <MeshDriftHeroShader />,
    },
    {
      id: "shader-2",
      title: t.shader2TabTitle,
      description: t.shader2TabDescription,
      render: () => <AuroraBlendBannerShader />,
    },
    {
      id: "shader-3",
      title: t.shader3TabTitle,
      description: t.shader3TabDescription,
      render: () => <GrainGradientPanelShader />,
    },
    {
      id: "shader-4",
      title: t.shader4TabTitle,
      description: t.shader4TabDescription,
      render: () => <ConicRingGlowShader />,
    },
    {
      id: "shader-5",
      title: t.shader5TabTitle,
      description: t.shader5TabDescription,
      render: () => <PulseSpotlightShader />,
    },
    {
      id: "shader-6",
      title: t.shader6TabTitle,
      description: t.shader6TabDescription,
      render: () => <WaveStripeBackdropShader />,
    },
    {
      id: "shader-7",
      title: t.shader7TabTitle,
      description: t.shader7TabDescription,
      render: () => <KaleidoscopeSwirlShader />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.shaderTitle}
      intro={m.examples.shaderDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="shader"
    />
  );
}
