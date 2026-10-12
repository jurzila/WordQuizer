import type { Collection, Word } from "../types";
import Page from "./ui/Page";
import PageHeader from "./ui/PageHeader";
import Card from "./ui/Card";
import EmptyState from "./ui/EmptyState";

type LessonDetailPageProps = {
  collection: Collection;
  words: Word[];
};

export default function LessonDetailPage({
  collection,
  words,
}: LessonDetailPageProps) {
  return (
    <Page>
      <PageHeader title={collection.name} />

      {words.length === 0 ? (
        <EmptyState title="No words in lesson yet." message="Add words." />
      ) : (
        <ul className="flex flex-col gap-2.5 pb-6">
          {words.map((item) => (
            <li key={item._id}>
              <Card>
                <div className="flex flex-row items-center justify-between gap-2">
                  <p className="flex-1 min-w-0 text-base font-semibold text-text-primary truncate">
                    {item.word}
                  </p>
                  <p className="flex-1 min-w-0 text-base text-text-secondary truncate text-right">
                    {item.translation}
                  </p>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </Page>
  );
}
