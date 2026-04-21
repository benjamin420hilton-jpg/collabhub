import { Check } from "lucide-react";

interface Props {
  current: 1 | 2;
  total?: number;
}

export function StepIndicator({ current, total = 2 }: Props) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-3" aria-label={`Step ${current} of ${total}`}>
      {steps.map((n, i) => {
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center gap-3">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                done
                  ? "bg-brand text-white"
                  : active
                    ? "bg-gradient-primary text-white shadow-md shadow-brand/20"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {done ? <Check className="size-4" /> : n}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 w-10 rounded-full ${
                  done ? "bg-brand" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
