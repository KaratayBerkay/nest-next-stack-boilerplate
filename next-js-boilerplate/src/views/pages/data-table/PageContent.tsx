"use client";

import { ExampleTabs } from "@/views/ui/_shared/ExampleTabs";
import { BasicDataTable } from "./BasicDataTable";
import { BorderedDataTable } from "./BorderedDataTable";
import { StripedDataTable } from "./StripedDataTable";
import { ScrollableDataTable } from "./ScrollableDataTable";
import { StickyHeaderDataTable } from "./StickyHeaderDataTable";
import { PaginatedDataTable } from "./PaginatedDataTable";
import { FullPaginationDataTable } from "./FullPaginationDataTable";
import { SingleColumnFilterDataTable } from "./SingleColumnFilterDataTable";
import { GlobalFilterDataTable } from "./GlobalFilterDataTable";
import { HideableColumnsDataTable } from "./HideableColumnsDataTable";
import { RowSelectionDataTable } from "./RowSelectionDataTable";
import { FacetedFilterDataTable } from "./FacetedFilterDataTable";
import { TabbedFilterDataTable } from "./TabbedFilterDataTable";
import { MultiFilterDataTable } from "./MultiFilterDataTable";
import { PinnedColumnsDataTable } from "./PinnedColumnsDataTable";
import { ExpandableRowsDataTable } from "./ExpandableRowsDataTable";
import { DraggableRowsDataTable } from "./DraggableRowsDataTable";
import { DraggableColumnsDataTable } from "./DraggableColumnsDataTable";
import { ColumnMenuDataTable } from "./ColumnMenuDataTable";
import { ResizableColumnsDataTable } from "./ResizableColumnsDataTable";
import { ColumnManagementDataTable } from "./ColumnManagementDataTable";
import { NestedSubTableDataTable } from "./NestedSubTableDataTable";
import { GroupedRowsDataTable } from "./GroupedRowsDataTable";
import { DateGroupedTransactionsDataTable } from "./DateGroupedTransactionsDataTable";
import { InvoiceLineItemsDataTable } from "./InvoiceLineItemsDataTable";
import { ScrollControlsTransactionsDataTable } from "./ScrollControlsTransactionsDataTable";
import { VirtualizedDataTable } from "./VirtualizedDataTable";
import { CellSelectionDataTable } from "./CellSelectionDataTable";
import { EditableCellsDataTable } from "./EditableCellsDataTable";
import { SearchHighlightDataTable } from "./SearchHighlightDataTable";
import { CrudDataTable } from "./CrudDataTable";
import { MultiSortDataTable } from "./MultiSortDataTable";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function DataTablePageContent({ initialTab }: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.dataTable;

  const examples: UIExample[] = [
    {
      id: "data-table-1",
      title: t.dataTable1TabTitle,
      description: t.dataTable1TabDescription,
      render: () => <BasicDataTable />,
    },
    {
      id: "data-table-2",
      title: t.dataTable2TabTitle,
      description: t.dataTable2TabDescription,
      render: () => <BorderedDataTable />,
    },
    {
      id: "data-table-3",
      title: t.dataTable3TabTitle,
      description: t.dataTable3TabDescription,
      render: () => <StripedDataTable />,
    },
    {
      id: "data-table-4",
      title: t.dataTable4TabTitle,
      description: t.dataTable4TabDescription,
      render: () => <ScrollableDataTable />,
    },
    {
      id: "data-table-5",
      title: t.dataTable5TabTitle,
      description: t.dataTable5TabDescription,
      render: () => <StickyHeaderDataTable />,
    },
    {
      id: "data-table-6",
      title: t.dataTable6TabTitle,
      description: t.dataTable6TabDescription,
      render: () => <PaginatedDataTable />,
    },
    {
      id: "data-table-7",
      title: t.dataTable7TabTitle,
      description: t.dataTable7TabDescription,
      render: () => <FullPaginationDataTable />,
    },
    {
      id: "data-table-8",
      title: t.dataTable8TabTitle,
      description: t.dataTable8TabDescription,
      render: () => <SingleColumnFilterDataTable />,
    },
    {
      id: "data-table-9",
      title: t.dataTable9TabTitle,
      description: t.dataTable9TabDescription,
      render: () => <GlobalFilterDataTable />,
    },
    {
      id: "data-table-10",
      title: t.dataTable10TabTitle,
      description: t.dataTable10TabDescription,
      render: () => <HideableColumnsDataTable />,
    },
    {
      id: "data-table-11",
      title: t.dataTable11TabTitle,
      description: t.dataTable11TabDescription,
      render: () => <RowSelectionDataTable />,
    },
    {
      id: "data-table-12",
      title: t.dataTable12TabTitle,
      description: t.dataTable12TabDescription,
      render: () => <FacetedFilterDataTable />,
    },
    {
      id: "data-table-13",
      title: t.dataTable13TabTitle,
      description: t.dataTable13TabDescription,
      render: () => <TabbedFilterDataTable />,
    },
    {
      id: "data-table-14",
      title: t.dataTable14TabTitle,
      description: t.dataTable14TabDescription,
      render: () => <MultiFilterDataTable />,
    },
    {
      id: "data-table-15",
      title: t.dataTable15TabTitle,
      description: t.dataTable15TabDescription,
      render: () => <PinnedColumnsDataTable />,
    },
    {
      id: "data-table-16",
      title: t.dataTable16TabTitle,
      description: t.dataTable16TabDescription,
      render: () => <ExpandableRowsDataTable />,
    },
    {
      id: "data-table-17",
      title: t.dataTable17TabTitle,
      description: t.dataTable17TabDescription,
      render: () => <DraggableRowsDataTable />,
    },
    {
      id: "data-table-18",
      title: t.dataTable18TabTitle,
      description: t.dataTable18TabDescription,
      render: () => <DraggableColumnsDataTable />,
    },
    {
      id: "data-table-19",
      title: t.dataTable19TabTitle,
      description: t.dataTable19TabDescription,
      render: () => <ColumnMenuDataTable />,
    },
    {
      id: "data-table-20",
      title: t.dataTable20TabTitle,
      description: t.dataTable20TabDescription,
      render: () => <ResizableColumnsDataTable />,
    },
    {
      id: "data-table-21",
      title: t.dataTable21TabTitle,
      description: t.dataTable21TabDescription,
      render: () => <ColumnManagementDataTable />,
    },
    {
      id: "data-table-22",
      title: t.dataTable22TabTitle,
      description: t.dataTable22TabDescription,
      render: () => <NestedSubTableDataTable />,
    },
    {
      id: "data-table-23",
      title: t.dataTable23TabTitle,
      description: t.dataTable23TabDescription,
      render: () => <GroupedRowsDataTable />,
    },
    {
      id: "data-table-24",
      title: t.dataTable24TabTitle,
      description: t.dataTable24TabDescription,
      render: () => <DateGroupedTransactionsDataTable />,
    },
    {
      id: "data-table-25",
      title: t.dataTable25TabTitle,
      description: t.dataTable25TabDescription,
      render: () => <InvoiceLineItemsDataTable />,
    },
    {
      id: "data-table-26",
      title: t.dataTable26TabTitle,
      description: t.dataTable26TabDescription,
      render: () => <ScrollControlsTransactionsDataTable />,
    },
    {
      id: "data-table-27",
      title: t.dataTable27TabTitle,
      description: t.dataTable27TabDescription,
      render: () => <VirtualizedDataTable />,
    },
    {
      id: "data-table-28",
      title: t.dataTable28TabTitle,
      description: t.dataTable28TabDescription,
      render: () => <CellSelectionDataTable />,
    },
    {
      id: "data-table-29",
      title: t.dataTable29TabTitle,
      description: t.dataTable29TabDescription,
      render: () => <EditableCellsDataTable />,
    },
    {
      id: "data-table-30",
      title: t.dataTable30TabTitle,
      description: t.dataTable30TabDescription,
      render: () => <SearchHighlightDataTable />,
    },
    {
      id: "data-table-31",
      title: t.dataTable31TabTitle,
      description: t.dataTable31TabDescription,
      render: () => <CrudDataTable />,
    },
    {
      id: "data-table-32",
      title: t.dataTable32TabTitle,
      description: t.dataTable32TabDescription,
      render: () => <MultiSortDataTable />,
    },
  ];

  return (
    <ExampleTabs
      title={m.examples.dataTableTitle}
      intro={m.examples.dataTableDescription}
      examples={examples}
      initialTab={initialTab}
    />
  );
}
