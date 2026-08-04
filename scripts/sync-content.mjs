import { execFileSync } from "node:child_process";
import {
  cp,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const siteRoot = process.cwd();
const contentRoot = path.resolve(
  process.env.CONTENT_DIR || path.join(siteRoot, "..", "QuartzNote"),
);
const sourceRoot = path.join(contentRoot, "articles");
const generatedContentRoot = path.join(siteRoot, "src", "content", "articles");
const generatedAssetRoot = path.join(siteRoot, "public", "article-assets");
const versionFile = path.join(siteRoot, "public", "content-version.json");
const requiredFields = [
  "id",
  "title",
  "slug",
  "date",
  "updated",
  "status",
  "tags",
  "summary",
];

const contentCommit = execFileSync(
  "git",
  ["-C", contentRoot, "rev-parse", "HEAD"],
  { encoding: "utf8" },
).trim();

await rm(generatedContentRoot, { recursive: true, force: true });
await rm(generatedAssetRoot, { recursive: true, force: true });
await mkdir(generatedContentRoot, { recursive: true });
await mkdir(generatedAssetRoot, { recursive: true });

const directoryEntries = await readdir(sourceRoot, { withFileTypes: true });
const articleDirectories = directoryEntries
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const seenIds = new Set();
const seenSlugs = new Set();
let publishedCount = 0;

for (const directory of articleDirectories) {
  const articleDirectory = path.join(sourceRoot, directory);
  const sourceFile = path.join(articleDirectory, "index.md");
  const rawSource = await readFile(sourceFile, "utf8");
  const parsed = matter(rawSource);
  const missingFields = requiredFields.filter(
    (field) => parsed.data[field] === undefined,
  );

  if (missingFields.length > 0) {
    throw new Error(
      `${directory}: missing front matter fields: ${missingFields.join(", ")}`,
    );
  }
  if (parsed.data.id !== directory) {
    throw new Error(`${directory}: id must match its directory`);
  }
  if (seenIds.has(parsed.data.id) || seenSlugs.has(parsed.data.slug)) {
    throw new Error(`${directory}: duplicate id or slug`);
  }

  seenIds.add(parsed.data.id);
  seenSlugs.add(parsed.data.slug);

  if (parsed.data.status !== "published") continue;

  const publicAssetPath = `/article-assets/${parsed.data.id}/`;
  const rewrittenBody = parsed.content
    .replaceAll("](./assets/", `](${publicAssetPath}`)
    .replaceAll('src="./assets/', `src="${publicAssetPath}`);

  const generatedSource = matter.stringify(rewrittenBody, {
    ...parsed.data,
    sourceCommit: contentCommit,
  });

  await writeFile(
    path.join(generatedContentRoot, `${parsed.data.id}.md`),
    generatedSource,
    "utf8",
  );

  const sourceAssets = path.join(articleDirectory, "assets");
  const targetAssets = path.join(generatedAssetRoot, parsed.data.id);
  await cp(sourceAssets, targetAssets, { recursive: true, force: true }).catch(
    (error) => {
      if (error.code !== "ENOENT") throw error;
    },
  );

  publishedCount += 1;
}

await writeFile(
  versionFile,
  `${JSON.stringify({ contentCommit, publishedCount }, null, 2)}\n`,
  "utf8",
);

console.log(
  `Loaded ${publishedCount} published articles from QuartzNote (${contentCommit.slice(0, 8)})`,
);
