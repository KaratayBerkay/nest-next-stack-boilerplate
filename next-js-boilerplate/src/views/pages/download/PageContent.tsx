"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { AppStoreDownload } from "./AppStoreDownload";
import { MinimalThreeColumnDownload } from "./MinimalThreeColumnDownload";
import { SingleFileDownload } from "./SingleFileDownload";
import { SplitFeatureIconsDownload } from "./SplitFeatureIconsDownload";
import { MultiOsSnippetsDownload } from "./MultiOsSnippetsDownload";
import { VersionedGridDownload } from "./VersionedGridDownload";
import { PhoneMockupPromoDownload } from "./PhoneMockupPromoDownload";
import { CenteredPlatformMatrixDownload } from "./CenteredPlatformMatrixDownload";
import { SplitPlatformStripDownload } from "./SplitPlatformStripDownload";
import { MultiPlatformDevicesDownload } from "./MultiPlatformDevicesDownload";
import { WindowsPreviewFrameDownload } from "./WindowsPreviewFrameDownload";
import { CenteredWingetDownload } from "./CenteredWingetDownload";
import { SplitOsTabsFormatsDownload } from "./SplitOsTabsFormatsDownload";
import { CenteredWindowsLinksDownload } from "./CenteredWindowsLinksDownload";
import { VersionAccordionDownload } from "./VersionAccordionDownload";
import { SearchableIntegrationsDownload } from "./SearchableIntegrationsDownload";
import { ThreeColumnRequirementsDownload } from "./ThreeColumnRequirementsDownload";
import { MobileQrPromoDownload } from "./MobileQrPromoDownload";
import { SalesFeaturesCalloutsDownload } from "./SalesFeaturesCalloutsDownload";
import { SplitMobileColumnsDownload } from "./SplitMobileColumnsDownload";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function DownloadPageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.download;

  const examples: UIExample[] = [
    {
      id: "download-1",
      title: t.download1TabTitle,
      description: t.download1TabDescription,
      render: () => <AppStoreDownload />,
    },
    {
      id: "download-2",
      title: t.download2TabTitle,
      description: t.download2TabDescription,
      render: () => <MinimalThreeColumnDownload />,
    },
    {
      id: "download-3",
      title: t.download3TabTitle,
      description: t.download3TabDescription,
      render: () => <SingleFileDownload />,
    },
    {
      id: "download-4",
      title: t.download4TabTitle,
      description: t.download4TabDescription,
      render: () => <SplitFeatureIconsDownload />,
    },
    {
      id: "download-5",
      title: t.download5TabTitle,
      description: t.download5TabDescription,
      render: () => <MultiOsSnippetsDownload />,
    },
    {
      id: "download-6",
      title: t.download6TabTitle,
      description: t.download6TabDescription,
      render: () => <VersionedGridDownload />,
    },
    {
      id: "download-7",
      title: t.download7TabTitle,
      description: t.download7TabDescription,
      render: () => <PhoneMockupPromoDownload />,
    },
    {
      id: "download-8",
      title: t.download8TabTitle,
      description: t.download8TabDescription,
      render: () => <CenteredPlatformMatrixDownload />,
    },
    {
      id: "download-9",
      title: t.download9TabTitle,
      description: t.download9TabDescription,
      render: () => <SplitPlatformStripDownload />,
    },
    {
      id: "download-10",
      title: t.download10TabTitle,
      description: t.download10TabDescription,
      render: () => <MultiPlatformDevicesDownload />,
    },
    {
      id: "download-11",
      title: t.download11TabTitle,
      description: t.download11TabDescription,
      render: () => <WindowsPreviewFrameDownload />,
    },
    {
      id: "download-13",
      title: t.download13TabTitle,
      description: t.download13TabDescription,
      render: () => <CenteredWingetDownload />,
    },
    {
      id: "download-14",
      title: t.download14TabTitle,
      description: t.download14TabDescription,
      render: () => <SplitOsTabsFormatsDownload />,
    },
    {
      id: "download-15",
      title: t.download15TabTitle,
      description: t.download15TabDescription,
      render: () => <CenteredWindowsLinksDownload />,
    },
    {
      id: "download-17",
      title: t.download17TabTitle,
      description: t.download17TabDescription,
      render: () => <VersionAccordionDownload />,
    },
    {
      id: "download-18",
      title: t.download18TabTitle,
      description: t.download18TabDescription,
      render: () => <SearchableIntegrationsDownload />,
    },
    {
      id: "download-19",
      title: t.download19TabTitle,
      description: t.download19TabDescription,
      render: () => <ThreeColumnRequirementsDownload />,
    },
    {
      id: "download-20",
      title: t.download20TabTitle,
      description: t.download20TabDescription,
      render: () => <MobileQrPromoDownload />,
    },
    {
      id: "download-21",
      title: t.download21TabTitle,
      description: t.download21TabDescription,
      render: () => <SalesFeaturesCalloutsDownload />,
    },
    {
      id: "download-22",
      title: t.download22TabTitle,
      description: t.download22TabDescription,
      render: () => <SplitMobileColumnsDownload />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.downloadTitle}
      intro={m.examples.downloadDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
