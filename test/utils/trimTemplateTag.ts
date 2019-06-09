export function trim(
  str: TemplateStringsArray,
  ...interpolations: string[]
): string {
  const combined = str.reduce(
    (acc, b, index) => `${acc}${b}${interpolations[index] || ''}`,
    '',
  );
  return combined
    .split('\n')
    .reduce((a, b) => `${a.trim()}\n${b.trim()}`)
    .trim();
}
