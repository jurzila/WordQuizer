import { StyleSheet } from "react-native";
import { colors } from "./colors";
import { spacing, radius, fontSize } from "./spacing";

export const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.background,
  },

  title: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.textSecondary,
    marginBottom: spacing.xs + 2,
  },

  // buttons
  primaryButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: "center",
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderInput,
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "600",
    fontSize: fontSize.md,
  },

  secondaryButton: {
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderInput,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: colors.textSecondary,
    fontWeight: "500",
    fontSize: fontSize.md,
  },

  textButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs + 2,
  },
  textButtonText: {
    fontSize: fontSize.sm,
    fontWeight: "600",
    color: colors.primary,
  },
  textButtonTextMuted: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.textMuted,
  },
  deleteText: {
    fontSize: fontSize.sm,
    fontWeight: "500",
    color: colors.danger,
  },

  // inputs
  input: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: radius.md,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.base,
    backgroundColor: colors.surface,
  },

  // cards / lists
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg - 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.textPrimary,
  },
  list: {
    gap: spacing.md - 2,
    paddingBottom: spacing.xl,
  },

  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
    marginTop: spacing.md,
  },

  // quiz cards
  quizCard: {
    padding: spacing.lg,
    backgroundColor: colors.cardDefault,
    borderRadius: radius.sm,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  quizCardSelected: {
    borderColor: colors.cardSelectedBorder,
    backgroundColor: colors.cardSelected,
  },
  quizCardMatched: {
    borderColor: colors.cardMatchedBorder,
    backgroundColor: colors.cardMatched,
  },
  quizCardWrong: {
    borderColor: colors.cardWrongBorder,
    backgroundColor: colors.cardWrong,
  },
  quizCardText: {
    fontSize: 15,
    textAlign: "center",
  },

  // empty states
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xxl,
  },
  emptyText: {
    fontSize: fontSize.base,
    fontWeight: "600",
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
  },
});