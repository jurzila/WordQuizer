import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ApiError, getCollection, getWordsByCollection } from "../../../api";
import LessonDetailPage from "../../../components/LessonDetailPage";

export const Route = createFileRoute("/_authed/lessons/$collectionId")({
  loader: async ({ params }) => {
    try {
      const [collection, words] = await Promise.all([
        getCollection(params.collectionId),
        getWordsByCollection(params.collectionId),
      ]);
      return { collection, words };
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) throw notFound();
      throw error;
    }
  },

  component: LessonDetailRoute,
  notFoundComponent: LessonNotFound,
  errorComponent: LessonError,
});

function LessonDetailRoute() {
  const { collection, words } = Route.useLoaderData();
  return <LessonDetailPage collection={collection} words={words} />;
}

function LessonNotFound() {
  return (
    <div>
      <h1>The lesson was not found</h1>
      <Link to="/lessons">Back</Link>
    </div>
  );
}

function LessonError() {
  return (
    <div>
      <h1>Unexpected error.</h1>
      <Link to="/lessons">Back</Link>
    </div>
  );
}
