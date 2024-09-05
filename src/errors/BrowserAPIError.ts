export class BrowserAPIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BrowserAPIError";
  }
}