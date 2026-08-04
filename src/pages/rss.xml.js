import rss from "@astrojs/rss";
import { SITE } from "../config";
import { articlePath, getPublishedArticles } from "../lib/articles";

export async function GET(context) {
  const articles = await getPublishedArticles();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    items: articles.map((article) => ({
      title: article.data.title,
      description: article.data.summary,
      pubDate: article.data.date,
      link: articlePath(article),
      categories: article.data.tags,
    })),
  });
}
