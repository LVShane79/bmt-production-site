/**
 * Clerk's controls render inside the admin surface, whose editorial display
 * type is deliberately oversized. Keep the authentication controls compact,
 * legible, and independent from public-site typography.
 */
export const adminAuthAppearance = {
  variables: {
    colorPrimary: "#006b67",
    colorBackground: "#fbfcf8",
    colorInputBackground: "#ffffff",
    colorInputText: "#182022",
    colorText: "#182022",
    colorTextSecondary: "#526064",
    fontFamily: '"Avenir Next", Avenir, Inter, "Helvetica Neue", sans-serif',
    fontSize: "15px",
    borderRadius: "10px",
  },
  elements: {
    rootBox: { marginTop: "32px", maxWidth: "440px", width: "100%" },
    cardBox: { width: "100%" },
    card: {
      border: "1px solid rgba(0, 170, 168, 0.28)",
      boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
      width: "100%",
    },
    headerTitle: { fontSize: "24px", fontWeight: "650", letterSpacing: "-0.02em", lineHeight: "1.2" },
    headerSubtitle: { fontSize: "14px", lineHeight: "1.5" },
    formFieldLabel: { fontSize: "13px", fontWeight: "650", lineHeight: "1.35" },
    formFieldInput: { fontSize: "16px", minHeight: "44px" },
    formButtonPrimary: { fontSize: "14px", fontWeight: "700", minHeight: "44px" },
    footerActionText: { fontSize: "14px" },
    footerActionLink: { fontSize: "14px", fontWeight: "650" },
    socialButtonsBlockButton: { fontSize: "14px", minHeight: "44px" },
  },
} as const;
