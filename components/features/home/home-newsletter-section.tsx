import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeNewsletterSection() {
  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-primary p-8 text-primary-foreground shadow-2xl shadow-primary/20 sm:p-12">
          <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div className="relative">
              <div className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-primary-foreground/15 blur-2xl" />
              <p className="mb-4 inline-flex rounded-full border border-primary-foreground/30 bg-primary-foreground/15 px-4 py-2 text-sm font-bold">
                Don't Miss Out
              </p>
              <h2 className="max-w-3xl text-balance text-3xl font-black tracking-tight sm:text-5xl">
                Latest Trends & Offers
              </h2>
              <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
                Register to receive news about the latest offers, discount codes,
                and product drops.
              </p>
            </div>
            <form className="flex flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="newsletter-email">
                Email address
              </label>
              <input
                id="newsletter-email"
                aria-label="Email address"
                className="min-h-12 w-full rounded-full border-0 px-5 text-foreground outline-none ring-1 ring-primary-foreground/30 focus:ring-4 focus:ring-primary-foreground/40"
                placeholder="Email address"
                type="email"
              />
              <Button type="submit" size="lg" className="rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                <Mail className="mr-2 h-4 w-4" />
                Subscribe
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
