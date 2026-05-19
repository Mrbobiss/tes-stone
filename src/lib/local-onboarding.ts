const ONBOARDING_STORAGE_KEY = "tes-stone:v1:onboarding-dismissed";

function isBrowser() {
  return typeof window !== "undefined";
}

export function readOnboardingDismissed() {
  if (!isBrowser()) {
    return false;
  }

  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === "1";
}

export function dismissOnboarding() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, "1");
}
