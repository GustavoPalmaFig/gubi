/**
 * Converts a string to a color
 * @param str - The string to convert
 * @returns The color
 * I used this function to convert user names to a color (always the same color for the same name),
 * so people with the same name but different last names will have different colors.
 */
export function stringToColor(str: string): string {
  let hash = 0;

  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';
  // Define the maximum value for each RGB component to avoid too light colors
  const min = 20; // minimum to avoid too dark colors
  const max = 200; // maximum to avoid too light colors

  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xff;
    // Limit the value between min and max
    value = Math.max(min, Math.min(max, value));
    color += ('00' + value.toString(16)).slice(-2);
  }

  return color;
}
