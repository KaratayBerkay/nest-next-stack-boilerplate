import { z } from "zod";

export const filtersSchema = z.object({
  search: z.string().optional(),
  tags: z.array(z.string()),
  category: z.array(z.string()),
  sortBy: z.enum(["relevance", "date", "name"]),
  sortOrder: z.enum(["asc", "desc"]),
  status: z.enum(["", "active", "pending", "archived"]),
  pageSize: z.enum(["10", "25", "50"]),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});
