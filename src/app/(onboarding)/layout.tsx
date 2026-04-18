export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-dark">
      <div className="w-full max-w-2xl px-4 animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-white p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
