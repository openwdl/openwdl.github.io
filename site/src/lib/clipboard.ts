/**
 * Writes the given text string to the system clipboard using the
 * asynchronous Clipboard API. Rejects if the browser denies clipboard access.
 *
 * @param text - The plain-text string to place on the clipboard.
 */
export async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}
