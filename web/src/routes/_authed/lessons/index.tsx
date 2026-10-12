import { createFileRoute, useRouter } from "@tanstack/react-router";
import { createCollection, deleteCollection, getCollections, renameCollection } from "../../../api";
import LessonsPage from "../../../components/LessonsPage";

export const Route = createFileRoute("/_authed/lessons/")({
  loader: () => getCollections(),
  component: LessonsRoute,
});

function LessonsRoute() {
  const collections = Route.useLoaderData();
  const router = useRouter();

  const handleCreate = async (name: string) => {
    await createCollection(name);
    await router.invalidate();
  };

    const handleRename = async (name: string, collectionId: string) => {
    await renameCollection(name, collectionId);
    await router.invalidate();
  };

    const handleDelete = async (collectionId: string) => {
    await deleteCollection(collectionId);
    await router.invalidate();
  };
  return (
    <LessonsPage
      collections={collections}
      onCreate={handleCreate}
      onRename={handleRename}
      onDelete={handleDelete}
    />
  );
}
