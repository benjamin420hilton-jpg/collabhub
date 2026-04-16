import { z } from "zod/v4";

export const milestoneInputSchema = z.object({
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Amount must be positive"),
  dueDate: z.coerce.date().optional(),
});

export const createContractSchema = z.object({
  proposalId: z.string().uuid(),
  milestones: z
    .array(milestoneInputSchema)
    .min(1, "At least one milestone is required"),
});

export const submitMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  submissionUrl: z.string().url("Please enter a valid URL"),
  submissionNotes: z.string().optional(),
});

export const reviewMilestoneSchema = z.object({
  milestoneId: z.string().uuid(),
  action: z.enum(["approve", "request_revision"]),
  revisionNotes: z.string().optional(),
});

export type MilestoneInput = z.infer<typeof milestoneInputSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type SubmitMilestoneInput = z.infer<typeof submitMilestoneSchema>;
export type ReviewMilestoneInput = z.infer<typeof reviewMilestoneSchema>;
