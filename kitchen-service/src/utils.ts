export const convertToSnakeCase = (text: string): string =>
  text.toLowerCase().replaceAll(" ", "_");
