export function Footer() {
  return (
    <footer className="border-t border-border/50 py-6 mt-auto bg-gradient-to-r from-[oklch(0.97_0.01_275)] to-[oklch(0.97_0.01_330)]">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 px-4">
        <p className="text-sm text-muted-foreground">
          Content Trends Analyzer &copy; {new Date().getFullYear()}
        </p>
        <p className="text-sm font-medium gradient-text">
          Powered by SearchApi &amp; Google Trends ⚡
        </p>
      </div>
    </footer>
  );
}
