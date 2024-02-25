export function processContentAndReplaceUrls(
  content: string,
  searchUrl: string,
  replacementUrl: string,
): string {
  // Remplacer toutes les occurrences de searchUrl par replacementUrl dans les href des balises <a>
  const regex = new RegExp(
    'href="' + searchUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&") + '(.*?)"',
    "g",
  );
  const newContent = content.replace(regex, 'href="' + replacementUrl + '$1"');
  return newContent;
}
