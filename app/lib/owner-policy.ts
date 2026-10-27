export function isConfiguredOwner(userId: string | null, email: string | null, emailVerified: boolean, configuredIds: string | undefined) {
  const ids = new Set((configuredIds ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  return Boolean(userId && ids.size && ids.has(userId) && emailVerified && email?.toLowerCase() === "shane@blackmountain.tech");
}
