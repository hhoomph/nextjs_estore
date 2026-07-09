"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Testimonial {
  id: string;
  rating: number;
  title: string | null;
  comment: string;
  user: {
    name: string;
    image: string | null;
  };
}

export function HomeTestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/reviews?global=true&limit=4");
        if (!res.ok) return;
        const data = await res.json();
        if (data?.reviews?.length) {
          setTestimonials(data.reviews);
        }
      } catch {
        // Keep empty state on failure
      } finally {
        setLoading(false);
      }
    };

    void fetchTestimonials();
  }, []);

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-sm font-bold text-primary shadow-sm">
              User Feedbacks
            </p>
            <h2 className="text-balance text-3xl font-black tracking-tight text-foreground sm:text-5xl">
              What our customers say
            </h2>
          </div>
          <Link
            href="/contact"
            className="inline-flex w-fit items-center rounded-full border border-primary/25 bg-background px-5 py-3 text-sm font-black text-primary transition hover:bg-primary/10"
          >
            Contact support
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm">
                <div className="space-y-3">
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-muted animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-16 rounded bg-muted animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No reviews yet. Be the first to share your feedback!
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm ${i < testimonial.rating ? "text-warning" : "text-muted"}`}>
                      ★
                    </span>
                  ))}
                </div>
                {testimonial.title && (
                  <h3 className="font-black text-foreground mb-2">{testimonial.title}</h3>
                )}
                <p className="text-sm leading-7 text-muted-foreground">{testimonial.comment}</p>
                <div className="mt-6 flex items-center gap-3">
                  {testimonial.user.image ? (
                    <Image
                      src={testimonial.user.image}
                      alt={testimonial.user.name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-sm font-black text-muted-foreground">
                      {testimonial.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-black text-foreground">{testimonial.user.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground">Verified Customer</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center">
          <Button asChild={true} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/products">Shop best sellers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
