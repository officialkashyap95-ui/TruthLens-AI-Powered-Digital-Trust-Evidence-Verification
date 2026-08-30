export default function Footer() {
  return (
    <footer
      id="about"
      className="border-t border-slate-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                TL
              </div>

              <span className="text-lg font-semibold text-slate-900">
                TruthLens
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              AI-powered digital trust and evidence verification for a world
              where digital content needs more than a simple yes or no.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Product</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <a href="/verify" className="hover:text-slate-900">
                Verify Content
              </a>

              <a href="#capabilities" className="hover:text-slate-900">
                Capabilities
              </a>

              <a href="#evidence" className="hover:text-slate-900">
                Evidence
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900">Resources</h3>

            <div className="mt-4 flex flex-col gap-3 text-sm text-slate-500">
              <a href="#how-it-works" className="hover:text-slate-900">
                How It Works
              </a>

              <a href="#" className="hover:text-slate-900">
                GitHub
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-200 pt-6 text-sm text-slate-400">
          © 2026 TruthLens. Built for transparent digital verification.
        </div>
      </div>
    </footer>
  );
}