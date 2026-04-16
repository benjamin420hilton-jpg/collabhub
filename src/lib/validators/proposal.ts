import { z } from "zod/v4";

export const createProposalSchema = z.object({
  campaignId: z.string().uuid(),
  coverLetter: z.string().min(10, "Cover letter must be at least 10 characters").max(2000),
  proposedRate: z.coerce.number().int().min(0, "Rate must be positive"),
});

export type CreateProposalInput = z.infer<typeof createProposalSchema>;
