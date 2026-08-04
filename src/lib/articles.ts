import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection(
    "articles",
    ({ data }) => data.status === "published",
  );

  return articles.sort(
    (left, right) => right.data.date.valueOf() - left.data.date.valueOf(),
  );
}

export function articlePath(article: Article): string {
  return `/articles/${article.data.slug}/`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
