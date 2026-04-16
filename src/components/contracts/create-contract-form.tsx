"use client";

import { useTransition, useState } from "react";
import { createContract } from "@/server/actions/contracts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, DollarSign } from "lucide-react";
import type { MilestoneInput } from "@/lib/validators/contract";

interface CreateContractFormProps {
  proposalId: string;
  campaignTitle: string;
  influencerName: string;
  agreedRate: number;
  isGifting: boolean;
}

export function CreateContractForm({
  proposalId,
  campaignTitle,
  influencerName,
  agreedRate,
  isGifting,
}: CreateContractFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [milestonesList, setMilestonesList] = useState<MilestoneInput[]>([
    {
      title: "Final Deliverable",
      description: "",
      amount: agreedRate,
    },
  ]);

  const totalAmount = milestonesList.reduce((sum, m) => sum + (m.amount || 0), 0);

  function addMilestone() {
    setMilestonesList([
      ...milestonesList,
      { title: "", description: "", amount: 0 },
    ]);
  }

  function removeMilestone(index: number) {
    setMilestonesList(milestonesList.filter((_, i) => i !== index));
  }

  function updateMilestone(
    index: number,
    field: keyof MilestoneInput,
    value: string | number,
  ) {
    const updated = [...milestonesList];
    updated[index] = { ...updated[index], [field]: value };
    setMilestonesList(updated);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (milestonesList.length === 0) {
      setError("At least one milestone is required");
      return;
    }

    startTransition(async () => {
      const result = await createContract({
        proposalId,
        milestones: milestonesList,
      });
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Summary */}
        <Card className="animate-fade-in-up delay-100">
          <CardHeader>
            <CardTitle>Contract Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campaign</span>
              <span className="font-medium">{campaignTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Influencer</span>
              <span className="font-medium">{influencerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Agreed Rate</span>
              <span className="font-medium">
                {isGifting ? "Product Gifting" : `$${agreedRate} AUD`}
              </span>
            </div>
            {!isGifting && (
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium">Total Contract Value</span>
                <span className="font-bold text-lg">
                  ${totalAmount.toFixed(2)} AUD
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {/* Milestones */}
        <Card className="animate-fade-in-up delay-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Milestones</CardTitle>
              <CardDescription>
                Break the work into milestones. Each milestone can be submitted
                and approved independently.
              </CardDescription>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMilestone}
              className="border-violet/20 hover:bg-violet-light"
            >
              <Plus className="mr-1 size-4" /> Add
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {milestonesList.map((m, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/60 p-4 space-y-3 animate-scale-in"
              >
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-violet/20 bg-violet-light text-violet-dark"
                  >
                    Milestone {i + 1}
                  </Badge>
                  {milestonesList.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(i)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={m.title}
                    onChange={(e) => updateMilestone(i, "title", e.target.value)}
                    placeholder="e.g. Draft Content, Final Deliverable"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={m.description ?? ""}
                    onChange={(e) =>
                      updateMilestone(i, "description", e.target.value)
                    }
                    placeholder="What needs to be delivered for this milestone..."
                    rows={2}
                  />
                </div>

                {!isGifting && (
                  <div className="space-y-2">
                    <Label>Amount ($AUD) *</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={m.amount || ""}
                        onChange={(e) =>
                          updateMilestone(i, "amount", Number(e.target.value))
                        }
                        className="pl-9"
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-gradient-violet text-white shadow-md shadow-violet/20 transition-all hover:shadow-lg hover:shadow-violet/30 hover:-translate-y-0.5"
              disabled={isPending}
            >
              {isPending ? "Creating Contract..." : "Create Contract"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  );
}
