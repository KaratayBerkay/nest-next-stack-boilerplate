"use client";

import { TemplateBrowser } from "@/views/pages/_shared/TemplateBrowser";
import { SectionedFormCrudCompanies } from "./SectionedFormCrudCompanies";
import { CompanyListSheetFormCrudCompanies } from "./CompanyListSheetFormCrudCompanies";
import { CompanyGridDialogFormCrudCompanies } from "./CompanyGridDialogFormCrudCompanies";
import { QuickAddDialogCrudCompanies } from "./QuickAddDialogCrudCompanies";
import { GridFieldsDialogCrudCompanies } from "./GridFieldsDialogCrudCompanies";
import { TableDetailSheetCrudCompanies } from "./TableDetailSheetCrudCompanies";
import { ExpandableDetailRowsCrudCompanies } from "./ExpandableDetailRowsCrudCompanies";
import { AdvancedFilterSortTableCrudCompanies } from "./AdvancedFilterSortTableCrudCompanies";
import { ColumnVisibilityTableCrudCompanies } from "./ColumnVisibilityTableCrudCompanies";
import { useMessages } from "@/lib/i18n/MessagesProvider";
import type { UIExample } from "@/types/views/ui/ExampleTabs-types";
import type { InitialTabProps } from "@/types/views/ui/PageContent-types";

export default function CrudCompaniesPageContent({
  initialTab,
  initialFull,
}: InitialTabProps) {
  const m = useMessages("pages");
  const t = m.crudCompanies;

  const examples: UIExample[] = [
    {
      id: "crud-companies-1",
      title: t.crudCompanies1TabTitle,
      description: t.crudCompanies1TabDescription,
      render: () => <SectionedFormCrudCompanies />,
    },
    {
      id: "crud-companies-2",
      title: t.crudCompanies2TabTitle,
      description: t.crudCompanies2TabDescription,
      render: () => <CompanyListSheetFormCrudCompanies />,
    },
    {
      id: "crud-companies-3",
      title: t.crudCompanies3TabTitle,
      description: t.crudCompanies3TabDescription,
      render: () => <CompanyGridDialogFormCrudCompanies />,
    },
    {
      id: "crud-companies-4",
      title: t.crudCompanies4TabTitle,
      description: t.crudCompanies4TabDescription,
      render: () => <QuickAddDialogCrudCompanies />,
    },
    {
      id: "crud-companies-5",
      title: t.crudCompanies5TabTitle,
      description: t.crudCompanies5TabDescription,
      render: () => <GridFieldsDialogCrudCompanies />,
    },
    {
      id: "crud-companies-6",
      title: t.crudCompanies6TabTitle,
      description: t.crudCompanies6TabDescription,
      render: () => <TableDetailSheetCrudCompanies />,
    },
    {
      id: "crud-companies-7",
      title: t.crudCompanies7TabTitle,
      description: t.crudCompanies7TabDescription,
      render: () => <ExpandableDetailRowsCrudCompanies />,
    },
    {
      id: "crud-companies-8",
      title: t.crudCompanies8TabTitle,
      description: t.crudCompanies8TabDescription,
      render: () => <AdvancedFilterSortTableCrudCompanies />,
    },
    {
      id: "crud-companies-9",
      title: t.crudCompanies9TabTitle,
      description: t.crudCompanies9TabDescription,
      render: () => <ColumnVisibilityTableCrudCompanies />,
    },
  ];

  return (
    <TemplateBrowser
      title={m.examples.crudCompaniesTitle}
      intro={m.examples.crudCompaniesDescription}
      examples={examples}
      initialTab={initialTab}
      initialFull={initialFull}
      category="crud-companies"
    />
  );
}
