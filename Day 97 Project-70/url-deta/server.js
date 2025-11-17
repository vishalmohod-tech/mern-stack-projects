const express = require("express");
const path = require("path");
const { URL } = require("url");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, "public")));

function extractMeta(html) {
  const result = {
    title: null,
    description: null,
    ogTitle: null,
    ogDescription: null,
    ogImage: null,
    favicon: null
  };

  const safe = (m) => (m ? m.replace(/(^\s+|\s+$)/g, "") : null);

  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (titleMatch) result.title = safe(titleMatch[1]);

  const descMatch =
    html.match(/<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i) ||
    html.match(/<meta\s+content=["']([^"']*)["']\s+name=["']description["']/i);
  if (descMatch) result.description = safe(descMatch[1]);

  const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i);
  if (ogTitleMatch) result.ogTitle = safe(ogTitleMatch[1]);

  const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']*)["']/i);
  if (ogDescMatch) result.ogDescription = safe(ogDescMatch[1]);

  const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']*)["']/i);
  if (ogImageMatch) result.ogImage = safe(ogImageMatch[1]);


  const favMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon|apple-touch-icon)["'][^>]*>/i);
  if (favMatch) {

    const hrefMatch = favMatch[0].match(/href=["']([^"']*)["']/i);
    if (hrefMatch) result.favicon = safe(hrefMatch[1]);
  }

  return result;
}


function toAbsolute(base, urlStr) {
  try {
    return new URL(urlStr, base).href;
  } catch (e) {
    return urlStr;
  }
}

app.get("/api/preview", async (req, res) => {
  const raw = req.query.url;
  if (!raw) return res.status(400).json({ error: "Missing url query param" });

  let target;
  try {
    target = new URL(raw);
    if (!["http:", "https:"].includes(target.protocol)) throw new Error("Invalid protocol");
  } catch (err) {
    return res.status(400).json({ error: "Invalid URL" });
  }


  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const r = await fetch(target.href, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "URLPreviewBot/1.0 (+https://your-app)"
      }
    });
    clearTimeout(timeout);

    if (!r.ok) {
      return res.status(502).json({ error: `Failed to fetch target (status ${r.status})` });
    }

    const text = await r.text();

    const meta = extractMeta(text);


    const title = meta.ogTitle || meta.title || "";
    const description = meta.ogDescription || meta.description || "";
    let image = meta.ogImage || null;
    let favicon = meta.favicon || null;


    if (image) image = toAbsolute(target.href, image);
    if (favicon) favicon = toAbsolute(target.href, favicon);


    const domain = target.hostname.replace(/^www\./, "");

    res.json({
      success: true,
      url: target.href,
      domain,
      title,
      description,
      image,
      favicon
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Fetch timed out" });
    }
    console.error("Preview error:", err && err.message);
    return res.status(500).json({ error: "Error fetching or parsing page" });
  }
});


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "url-dt.html"));
});


app.listen(PORT, () => {
  console.log(`URL Preview service running on port ${PORT}`);
});
