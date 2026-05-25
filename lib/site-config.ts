export const FALLBACK_DRIVE_FOLDER_ID = "1-G7MLzSBuB5n1KsvfpVXXAXBe7n55Ny_";

export function getDefaultDriveSource() {
  return process.env.DEFAULT_DRIVE_FOLDER_ID?.trim() || FALLBACK_DRIVE_FOLDER_ID;
}
