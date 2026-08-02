export interface InvoicePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  previousLabel: string;
  nextLabel: string;
}
