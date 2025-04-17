export function isHtml(value: string): boolean {
  const htmlPattern = /<\/?[a-z][\s\S]*>/i;
  return htmlPattern.test(value);
}
