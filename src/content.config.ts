import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    id: z.string(),
    title: z.string(),
    slug: z.string(),
    date: z.coerce.date(),
    publishedAt: z.coerce.date().optional(),
    updated: z.coerce.date(),
    status: z.enum(["draft", "published", "archived"]),
    tags: z.array(z.string()),
    summary: z.string(),
    sourceCommit: z.string().optional(),
  }),
});

export const collections = { articles };
