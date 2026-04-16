export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero">
      <div className="w-full max-w-2xl px-4 animate-fade-in">{children}</div>
    </div>
  );
}
