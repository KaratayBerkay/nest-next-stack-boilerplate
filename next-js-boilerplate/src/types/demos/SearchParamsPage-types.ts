export interface SearchParamsPageProps {
  searchParams: Promise<{ name?: string; category?: string }>;
}

export interface ServerParamsProps {
  searchParams: Promise<{ name?: string; category?: string }>;
}
