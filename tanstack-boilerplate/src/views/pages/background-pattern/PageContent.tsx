"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { WithRadialGradient } from "./WithRadialGradient";
import { WithBottomRadialGradient } from "./WithBottomRadialGradient";
import { WithLinearGrid } from "./WithLinearGrid";
import { WithGridCornerFade } from "./WithGridCornerFade";
import { WithLargeCellGrid } from "./WithLargeCellGrid";
import { WithSquareTiledGrid } from "./WithSquareTiledGrid";
import { WithGridCenterFade } from "./WithGridCenterFade";
import { WithGridBottomLeftFade } from "./WithGridBottomLeftFade";
import { WithGridBottomRightFade } from "./WithGridBottomRightFade";
import { WithCssGrid } from "./WithCssGrid";
import { WithDiagonalCrossGrid } from "./WithDiagonalCrossGrid";
import { WithDiagonalCrossFades } from "./WithDiagonalCrossFades";
import { WithCrosshatchSideFade } from "./WithCrosshatchSideFade";
import { WithDiagonalCrossTopFade } from "./WithDiagonalCrossTopFade";
import { WithDiagonalCrossBottomCenter } from "./WithDiagonalCrossBottomCenter";
import { WithDiagonalCrossLowerLeft } from "./WithDiagonalCrossLowerLeft";
import { WithDiagonalCrossLowerRight } from "./WithDiagonalCrossLowerRight";
import { WithDiagonalCrossCenter } from "./WithDiagonalCrossCenter";
import { WithDashedGrid } from "./WithDashedGrid";
import { WithDashedGridTopLeft } from "./WithDashedGridTopLeft";
import { WithDashedGridTopRight } from "./WithDashedGridTopRight";
import { WithDashedGridTopEdge } from "./WithDashedGridTopEdge";
import { WithDashedGridRadialMask } from "./WithDashedGridRadialMask";
import { WithDashedGridCornerFade } from "./WithDashedGridCornerFade";
import { WithDashedGridBottomLeftFade } from "./WithDashedGridBottomLeftFade";
import { WithDashedGridCenterFade } from "./WithDashedGridCenterFade";
import { WithRadialGlowTopCenter } from "./WithRadialGlowTopCenter";
import { WithCenterSpotlight } from "./WithCenterSpotlight";
import { WithTopRadialGlow } from "./WithTopRadialGlow";
import { WithDualRadialGradient } from "./WithDualRadialGradient";
import { WithCircuitBoard } from "./WithCircuitBoard";
import { WithCircuitBoardTopLeft } from "./WithCircuitBoardTopLeft";
import { WithCircuitBoardTopRight } from "./WithCircuitBoardTopRight";
import { WithCircuitBoardTopFade } from "./WithCircuitBoardTopFade";
import { WithCircuitBoardBottomFade } from "./WithCircuitBoardBottomFade";
import { WithCircuitBoardBottomLeft } from "./WithCircuitBoardBottomLeft";
import { WithCircuitBoardBottomRight } from "./WithCircuitBoardBottomRight";
import { WithCircuitBoardEdgeFade } from "./WithCircuitBoardEdgeFade";
import { WithGridAndDot } from "./WithGridAndDot";
import { WithGridAndDotTopLeft } from "./WithGridAndDotTopLeft";
import { WithMultiCornerGlow } from "./WithMultiCornerGlow";
import { WithCornerGradientNoise } from "./WithCornerGradientNoise";
import { WithBlurredMeshGlow } from "./WithBlurredMeshGlow";
import { WithBottomGlowGradient } from "./WithBottomGlowGradient";
import { WithDuoCornerGradient } from "./WithDuoCornerGradient";
import { WithBottomBlurredNoise } from "./WithBottomBlurredNoise";
import { WithDotGridLeftFade } from "./WithDotGridLeftFade";
import { WithDotGridRightFade } from "./WithDotGridRightFade";
import { WithDotGridBottomCorner } from "./WithDotGridBottomCorner";
import { WithDotGridCenterVignette } from "./WithDotGridCenterVignette";
import { WithDotGridTopBand } from "./WithDotGridTopBand";
import { WithDotGridBottomBand } from "./WithDotGridBottomBand";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function BackgroundPatternPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.backgroundPattern;

  const examples: UIExample[] = [
    {
      id: "bg-pattern-1",
      title: t.bgp1TabTitle,
      description: t.bgp1TabDescription,
      render: () => <WithRadialGradient />,
    },
    {
      id: "bg-pattern-2",
      title: t.bgp2TabTitle,
      description: t.bgp2TabDescription,
      render: () => <WithBottomRadialGradient />,
    },
    {
      id: "bg-pattern-3",
      title: t.bgp3TabTitle,
      description: t.bgp3TabDescription,
      render: () => <WithLinearGrid />,
    },
    {
      id: "bg-pattern-4",
      title: t.bgp4TabTitle,
      description: t.bgp4TabDescription,
      render: () => <WithGridCornerFade />,
    },
    {
      id: "bg-pattern-5",
      title: t.bgp5TabTitle,
      description: t.bgp5TabDescription,
      render: () => <WithLargeCellGrid />,
    },
    {
      id: "bg-pattern-6",
      title: t.bgp6TabTitle,
      description: t.bgp6TabDescription,
      render: () => <WithSquareTiledGrid />,
    },
    {
      id: "bg-pattern-7",
      title: t.bgp7TabTitle,
      description: t.bgp7TabDescription,
      render: () => <WithGridCenterFade />,
    },
    {
      id: "bg-pattern-8",
      title: t.bgp8TabTitle,
      description: t.bgp8TabDescription,
      render: () => <WithGridBottomLeftFade />,
    },
    {
      id: "bg-pattern-9",
      title: t.bgp9TabTitle,
      description: t.bgp9TabDescription,
      render: () => <WithGridBottomRightFade />,
    },
    {
      id: "bg-pattern-10",
      title: t.bgp10TabTitle,
      description: t.bgp10TabDescription,
      render: () => <WithCssGrid />,
    },
    {
      id: "bg-pattern-11",
      title: t.bgp11TabTitle,
      description: t.bgp11TabDescription,
      render: () => <WithDiagonalCrossGrid />,
    },
    {
      id: "bg-pattern-12",
      title: t.bgp12TabTitle,
      description: t.bgp12TabDescription,
      render: () => <WithDiagonalCrossFades />,
    },
    {
      id: "bg-pattern-13",
      title: t.bgp13TabTitle,
      description: t.bgp13TabDescription,
      render: () => <WithCrosshatchSideFade />,
    },
    {
      id: "bg-pattern-14",
      title: t.bgp14TabTitle,
      description: t.bgp14TabDescription,
      render: () => <WithDiagonalCrossTopFade />,
    },
    {
      id: "bg-pattern-15",
      title: t.bgp15TabTitle,
      description: t.bgp15TabDescription,
      render: () => <WithDiagonalCrossBottomCenter />,
    },
    {
      id: "bg-pattern-16",
      title: t.bgp16TabTitle,
      description: t.bgp16TabDescription,
      render: () => <WithDiagonalCrossLowerLeft />,
    },
    {
      id: "bg-pattern-17",
      title: t.bgp17TabTitle,
      description: t.bgp17TabDescription,
      render: () => <WithDiagonalCrossLowerRight />,
    },
    {
      id: "bg-pattern-18",
      title: t.bgp18TabTitle,
      description: t.bgp18TabDescription,
      render: () => <WithDiagonalCrossCenter />,
    },
    {
      id: "bg-pattern-19",
      title: t.bgp19TabTitle,
      description: t.bgp19TabDescription,
      render: () => <WithDashedGrid />,
    },
    {
      id: "bg-pattern-20",
      title: t.bgp20TabTitle,
      description: t.bgp20TabDescription,
      render: () => <WithDashedGridTopLeft />,
    },
    {
      id: "bg-pattern-21",
      title: t.bgp21TabTitle,
      description: t.bgp21TabDescription,
      render: () => <WithDashedGridTopRight />,
    },
    {
      id: "bg-pattern-22",
      title: t.bgp22TabTitle,
      description: t.bgp22TabDescription,
      render: () => <WithDashedGridTopEdge />,
    },
    {
      id: "bg-pattern-23",
      title: t.bgp23TabTitle,
      description: t.bgp23TabDescription,
      render: () => <WithDashedGridRadialMask />,
    },
    {
      id: "bg-pattern-24",
      title: t.bgp24TabTitle,
      description: t.bgp24TabDescription,
      render: () => <WithDashedGridCornerFade />,
    },
    {
      id: "bg-pattern-25",
      title: t.bgp25TabTitle,
      description: t.bgp25TabDescription,
      render: () => <WithDashedGridBottomLeftFade />,
    },
    {
      id: "bg-pattern-26",
      title: t.bgp26TabTitle,
      description: t.bgp26TabDescription,
      render: () => <WithDashedGridCenterFade />,
    },
    {
      id: "bg-pattern-27",
      title: t.bgp27TabTitle,
      description: t.bgp27TabDescription,
      render: () => <WithRadialGlowTopCenter />,
    },
    {
      id: "bg-pattern-28",
      title: t.bgp28TabTitle,
      description: t.bgp28TabDescription,
      render: () => <WithCenterSpotlight />,
    },
    {
      id: "bg-pattern-29",
      title: t.bgp29TabTitle,
      description: t.bgp29TabDescription,
      render: () => <WithTopRadialGlow />,
    },
    {
      id: "bg-pattern-30",
      title: t.bgp30TabTitle,
      description: t.bgp30TabDescription,
      render: () => <WithDualRadialGradient />,
    },
    {
      id: "bg-pattern-31",
      title: t.bgp31TabTitle,
      description: t.bgp31TabDescription,
      render: () => <WithCircuitBoard />,
    },
    {
      id: "bg-pattern-32",
      title: t.bgp32TabTitle,
      description: t.bgp32TabDescription,
      render: () => <WithCircuitBoardTopLeft />,
    },
    {
      id: "bg-pattern-33",
      title: t.bgp33TabTitle,
      description: t.bgp33TabDescription,
      render: () => <WithCircuitBoardTopRight />,
    },
    {
      id: "bg-pattern-34",
      title: t.bgp34TabTitle,
      description: t.bgp34TabDescription,
      render: () => <WithCircuitBoardTopFade />,
    },
    {
      id: "bg-pattern-35",
      title: t.bgp35TabTitle,
      description: t.bgp35TabDescription,
      render: () => <WithCircuitBoardBottomFade />,
    },
    {
      id: "bg-pattern-36",
      title: t.bgp36TabTitle,
      description: t.bgp36TabDescription,
      render: () => <WithCircuitBoardBottomLeft />,
    },
    {
      id: "bg-pattern-37",
      title: t.bgp37TabTitle,
      description: t.bgp37TabDescription,
      render: () => <WithCircuitBoardBottomRight />,
    },
    {
      id: "bg-pattern-38",
      title: t.bgp38TabTitle,
      description: t.bgp38TabDescription,
      render: () => <WithCircuitBoardEdgeFade />,
    },
    {
      id: "bg-pattern-39",
      title: t.bgp39TabTitle,
      description: t.bgp39TabDescription,
      render: () => <WithGridAndDot />,
    },
    {
      id: "bg-pattern-40",
      title: t.bgp40TabTitle,
      description: t.bgp40TabDescription,
      render: () => <WithGridAndDotTopLeft />,
    },
    {
      id: "bg-pattern-95",
      title: t.bgp95TabTitle,
      description: t.bgp95TabDescription,
      render: () => <WithMultiCornerGlow />,
    },
    {
      id: "bg-pattern-96",
      title: t.bgp96TabTitle,
      description: t.bgp96TabDescription,
      render: () => <WithCornerGradientNoise />,
    },
    {
      id: "bg-pattern-97",
      title: t.bgp97TabTitle,
      description: t.bgp97TabDescription,
      render: () => <WithBlurredMeshGlow />,
    },
    {
      id: "bg-pattern-98",
      title: t.bgp98TabTitle,
      description: t.bgp98TabDescription,
      render: () => <WithBottomGlowGradient />,
    },
    {
      id: "bg-pattern-99",
      title: t.bgp99TabTitle,
      description: t.bgp99TabDescription,
      render: () => <WithDuoCornerGradient />,
    },
    {
      id: "bg-pattern-100",
      title: t.bgp100TabTitle,
      description: t.bgp100TabDescription,
      render: () => <WithBottomBlurredNoise />,
    },
    {
      id: "bg-pattern-111",
      title: t.bgp111TabTitle,
      description: t.bgp111TabDescription,
      render: () => <WithDotGridLeftFade />,
    },
    {
      id: "bg-pattern-112",
      title: t.bgp112TabTitle,
      description: t.bgp112TabDescription,
      render: () => <WithDotGridRightFade />,
    },
    {
      id: "bg-pattern-113",
      title: t.bgp113TabTitle,
      description: t.bgp113TabDescription,
      render: () => <WithDotGridBottomCorner />,
    },
    {
      id: "bg-pattern-115",
      title: t.bgp115TabTitle,
      description: t.bgp115TabDescription,
      render: () => <WithDotGridCenterVignette />,
    },
    {
      id: "bg-pattern-116",
      title: t.bgp116TabTitle,
      description: t.bgp116TabDescription,
      render: () => <WithDotGridTopBand />,
    },
    {
      id: "bg-pattern-117",
      title: t.bgp117TabTitle,
      description: t.bgp117TabDescription,
      render: () => <WithDotGridBottomBand />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.backgroundPatternTitle}
      intro={m.examples.backgroundPatternDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="background-pattern"
    />
  );
}
