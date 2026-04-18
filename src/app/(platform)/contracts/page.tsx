import { redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithProfile } from "@/server/queries/profiles";
import {
  getContractsForBrand,
  getContractsForInfluencer,
} from "@/server/queries/contracts";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText } from "lucide-react";
import { centsToDollars } from "@/lib/constants";
import type { BrandProfile, InfluencerProfile } from "@/types";

const statusColors: Record<string, string> = {
  pending_escrow: "border-amber-300/50 bg-amber-50 text-amber-700",
  escrow_funded: "border-blue-300/50 bg-blue-50 text-blue-700",
  active: "border-coral/20 bg-coral-light text-coral-dark",
  completed: "border-green-300/50 bg-green-50 text-green-700",
  disputed: "border-red-300/50 bg-red-50 text-red-700",
  canceled: "border-gray-300/50 bg-gray-50 text-gray-700",
};

export default async function ContractsPage() {
  const data = await getUserWithProfile();
  if (!data || !data.profile) redirect("/dashboard");

  const contractResults =
    data.role === "brand"
      ? await getContractsForBrand((data.profile as BrandProfile).id)
      : await getContractsForInfluencer(
          (data.profile as InfluencerProfile).id,
        );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="animate-fade-in-up">
        <h1 className="text-3xl font-bold">Contracts</h1>
        <p className="mt-1 text-muted-foreground">
          {data.role === "brand"
            ? "Manage your active contracts and milestones."
            : "Track your contracts and deliverables."}
        </p>
      </div>

      {contractResults.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 animate-fade-in-up delay-100">
          <div className="rounded-2xl bg-coral-light p-4">
            <FileText className="size-8 text-coral" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No contracts yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {data.role === "brand"
              ? "Accept a proposal and create a contract to get started."
              : "Get accepted on a campaign to receive your first contract."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {contractResults.map(({ contract, campaignTitle, ...rest }, i) => {
            const otherParty =
              "influencerName" in rest
                ? rest.influencerName
                : "brandName" in rest
                  ? rest.brandName
                  : "";

            return (
              <Link key={contract.id} href={`/contracts/${contract.id}`}>
                <Card
                  className="card-hover animate-fade-in-up"
                  style={{ animationDelay: `${(i + 1) * 100}ms` }}
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-lg">
                        {campaignTitle}
                      </CardTitle>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        with {otherParty}
                      </p>
                    </div>
                    <Badge className={statusColors[contract.status] ?? ""}>
                      {contract.status.replace("_", " ")}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      {contract.totalAmount > 0 && (
                        <span className="font-medium text-foreground">
                          ${centsToDollars(contract.totalAmount)} AUD
                        </span>
                      )}
                      <span>
                        Created{" "}
                        {new Date(contract.createdAt).toLocaleDateString(
                          "en-AU",
                        )}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
