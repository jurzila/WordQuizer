import { queryOptions } from "@tanstack/react-query";
import { getCollections } from "./api";

export const collectionsQuery = queryOptions({
  queryKey: ["collections"],
  queryFn: getCollections,
});
