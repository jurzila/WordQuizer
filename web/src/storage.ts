export const TOKEN_KEY = "token";
export const EMAIL_KEY = "email";

export function readStored(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch (error) {
    return null;
  }
}

export function writeStored(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error(error);
  }
}

export function clearStored(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(error);
  }
}
