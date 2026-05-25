export const FALLBACK_DRIVE_FOLDER_ID = "1Cw6HaLqaswgHWeW5mmcuKzrNbXBd2wRs";

export function getDefaultDriveSource() {
  return process.env.DEFAULT_DRIVE_FOLDER_ID?.trim() || FALLBACK_DRIVE_FOLDER_ID;
}
