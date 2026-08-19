import { getCollection, type CollectionEntry } from "astro:content";

export type Article = CollectionEntry<"articles">;

function publicationTime(article: Article): number {
  return (article.data.publishedAt ?? article.data.date).valueOf();
}

export async function getPublishedArticles(): Promise<Article[]> {
  const articles = await getCollection(
    "articles",
    ({ data }) => data.status === "published",
  );

  return articles.sort((left, right) => {
    const timeDifference = publicationTime(right) - publicationTime(left);
    if (timeDifference !== 0) return timeDifference;

    return right.data.slug.localeCompare(left.data.slug, "en");
  });
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
