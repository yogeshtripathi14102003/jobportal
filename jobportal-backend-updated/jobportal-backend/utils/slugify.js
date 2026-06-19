/**
 * Converts text into a URL-safe slug.
 * e.g. slugify("Senior Sales Executive", "abc123") -> "senior-sales-executive-abc123"
 */
function slugify(text, suffix = "") {
  const base = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return suffix ? `${base}-${suffix}` : base;
}

export default slugify;
