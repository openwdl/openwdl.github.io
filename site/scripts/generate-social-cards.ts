import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { BLOG_ROUTE_DATA } from "../src/generated/blog-routes.generated";
import { DOC_PAGES } from "../src/generated/docs.generated";

const siteRoot = fileURLToPath(new URL("..", import.meta.url));
const outputRoot = join(siteRoot, "public");
const regularFont = await readFile(fileURLToPath(import.meta.resolve("@fontsource/public-sans/files/public-sans-latin-400-normal.woff")));
const boldFont = await readFile(fileURLToPath(import.meta.resolve("@fontsource/public-sans/files/public-sans-latin-700-normal.woff")));
const monoFont = await readFile(fileURLToPath(import.meta.resolve("@fontsource/martian-mono/files/martian-mono-latin-500-normal.woff")));
const logoSvg = await readFile(join(siteRoot, "..", "assets", "openwdl-logo.svg"), "utf8");
const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString("base64")}`;

type CardData = { title: string; description?: string; label?: string };

function card({ title, description, label = "OPEN STANDARD" }: CardData) {
  return {
    type: "div",
    props: {
      style: { width: "1200px", height: "630px", display: "flex", background: "#10131c", color: "#fff", padding: "62px 76px 54px", position: "relative", overflow: "hidden", flexDirection: "column" },
      children: [
        { type: "div", props: { style: { position: "absolute", inset: 0, opacity: 0.62, backgroundImage: "radial-gradient(#242833 1.5px, transparent 1.5px)", backgroundSize: "22px 22px" } } },
        { type: "div", props: { style: { position: "relative", display: "flex", flexDirection: "column", width: "100%", height: "100%" }, children: [
          { type: "div", props: { style: { display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }, children: [
            { type: "img", props: { src: logoSrc, width: 224, height: 58 } },
            { type: "div", props: { style: { display: "flex", alignItems: "center", fontFamily: "Mono", fontSize: 17, letterSpacing: 3, color: "#86e5fc" }, children: label } },
          ] } },
          { type: "div", props: { style: { width: "100%", height: 2, background: "#4bd8fa", marginTop: 38, opacity: 0.9 } } },
          { type: "div", props: { style: { display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1, paddingBottom: 12 }, children: [
            { type: "div", props: { style: { fontFamily: "Sans", fontSize: title.length > 42 ? 58 : 72, lineHeight: 1.07, fontWeight: 700, maxWidth: 990, letterSpacing: -1.5 }, children: title } },
            { type: "div", props: { style: { fontFamily: "Sans", fontSize: 25, lineHeight: 1.4, color: "#c7c8cb", marginTop: 24, maxWidth: 930 }, children: description ?? "Workflow Description Language" } },
          ] } },
          { type: "div", props: { style: { display: "flex", justifyContent: "flex-end", alignItems: "center", width: "100%" }, children: [
            { type: "div", props: { style: { fontFamily: "Mono", fontSize: 15, letterSpacing: 2, color: "#696e7a" }, children: "OPENWDL.ORG" } },
          ] } },
        ] } },
      ],
    },
  };
}

async function render(data: CardData, path: string) {
  const svg = await satori(card(data) as never, { width: 1200, height: 630, fonts: [
    { name: "Sans", data: regularFont, weight: 400 },
    { name: "Sans", data: boldFont, weight: 700 },
    { name: "Mono", data: monoFont, weight: 500 },
  ] });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  await mkdir(join(outputRoot, path, ".."), { recursive: true });
  await writeFile(join(outputRoot, path), png);
}

await render({
  title: "OpenWDL",
  description: "A human-readable description language for running workflows anywhere.",
}, "social-card.png");
await render({
  title: "The OpenWDL Blog",
  description: "Releases, tooling, and reports from the open standard.",
  label: "OPENWDL / BLOG",
}, "blog/social-card.png");
for (const post of BLOG_ROUTE_DATA) {
  await render({ title: post.title, description: post.standfirst, label: "OPENWDL / BLOG" }, `blog/${post.slug}/social-card.png`);
}
for (const page of DOC_PAGES) {
  await render(
    { title: page.title, description: page.description, label: "OPENWDL / DOCS" },
    `${page.slug.slice(1)}social-card.png`,
  );
}
console.log(`Generated ${BLOG_ROUTE_DATA.length + DOC_PAGES.length + 2} social card(s).`);
