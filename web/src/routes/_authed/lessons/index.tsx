import { createFileRoute } from "@tanstack/react-router";
import { getCollections } from "../../../api";
import LessonsPage from "../../../components/LessonsPage";


export const Route = createFileRoute("/_authed/lessons/")({ 
    loader: () => getCollections(),
    component: LessonsRoute 
});

function LessonsRoute() {
    const collections = Route.useLoaderData()
    return (
      <LessonsPage collections={collections} />
    )
}