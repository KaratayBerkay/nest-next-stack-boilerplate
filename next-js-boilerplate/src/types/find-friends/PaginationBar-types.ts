export interface PaginationBarProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  prevLabel: string;
  nextLabel: string;
}
