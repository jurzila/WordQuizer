import { createFileRoute } from "@tanstack/react-router";
import {
  createCollection,
  deleteCollection,
  renameCollection,
} from "../../../api";
import LessonsPage from "../../../components/LessonsPage";
import { collectionsQuery } from "../../../queries";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

export const Route = createFileRoute("/_authed/lessons/")({
  loader: ({ context }) =>
    context.queryClient.query({
      ...collectionsQuery,
      staleTime: "static",
    }),
  component: LessonsRoute,
});

function LessonsRoute() {
  const collections = useSuspenseQuery(collectionsQuery).data;
  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: (name: string) => createCollection(name),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: collectionsQuery.queryKey }),
  });
  const renameMutation = useMutation({
    mutationFn: ({
      name,
      collectionId,
    }: {
      name: string;
      collectionId: string;
    }) => renameCollection(name, collectionId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: collectionsQuery.queryKey }),
  });
  const deleteMutation = useMutation({
    mutationFn: (collectionId: string) => deleteCollection(collectionId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: collectionsQuery.queryKey }),
  });


  return (
    <LessonsPage
      collections={collections}
      onCreate={createMutation.mutateAsync}
      onRename={(name, collectionId) => renameMutation.mutateAsync({ name, collectionId })}
      onDelete={deleteMutation.mutateAsync}
    />
  );
}
