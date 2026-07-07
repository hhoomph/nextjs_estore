import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface HomeTestimonial {
  quote: string;
  name: string;
  role: string;
  image: string;
}

const testimonials: HomeTestimonial[] = [
  {
    quote:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula.",
    name: "Wilson Dias",
    role: "Backend Developer",
    image:
      "https://res.cloudinary.com/dc6svbdh9/image/upload/v1774779614/next-merce-admin-uploads/ubqsu5foe6ty7kfcrsnb.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula.",
    name: "John Doe",
    role: "Frontend Developer",
    image:
      "https://res.cloudinary.com/dc6svbdh9/image/upload/v1774779748/next-merce-admin-uploads/xujiac1uxhokqhxzpukf.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula.",
    name: "Mark Smith",
    role: "Full Stack Developer",
    image:
      "https://res.cloudinary.com/dc6svbdh9/image/upload/v1774780500/next-merce-admin-uploads/chu9dnetbf8l4j25jkam.jpg",
  },
  {
    quote:
      "Lorem ipsum dolor sit amet, adipiscing elit. Donec malesuada justo vitae augue suscipit beautiful vehicula.",
    name: "John Smith",
    role: "DevOps Engineer",
    image:
      "https://res.cloudinary.com/dc6svbdh9/image/upload/v1774780661/next-merce-admin-uploads/jhyjkfe4gb57spcrfyw.jpg",
  },
];

export function HomeTestimonialsSection() {
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

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.name}
              className="rounded-[2rem] border border-border/60 bg-card p-6 shadow-sm"
            >
              <p className="text-sm leading-7 text-muted-foreground">{testimonial.quote}</p>
              <div className="mt-6 flex items-center gap-3">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="font-black text-foreground">{testimonial.name}</h3>
                  <p className="text-xs font-bold text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Button asChild={true} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link href="/products">Shop best sellers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
