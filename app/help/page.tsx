/**
 * Help page
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingPage } from "@/components/ui/loading";
import { HelpCircle, Book, ShoppingCart, User, CreditCard, Truck, Mail } from "lucide-react";

const helpCategories = [
  {
    title: "Getting Started",
    description: "Learn the basics of shopping on our platform",
    icon: Book,
    href: "#getting-started",
  },
  {
    title: "Shopping Guide",
    description: "How to browse, search, and purchase products",
    icon: ShoppingCart,
    href: "#shopping",
  },
  {
    title: "Account & Profile",
    description: "Managing your account settings and preferences",
    icon: User,
    href: "#account",
  },
  {
    title: "Payment Methods",
    description: "Accepted payments and security information",
    icon: CreditCard,
    href: "#payment",
  },
  {
    title: "Shipping & Delivery",
    description: "Delivery times, costs, and tracking orders",
    icon: Truck,
    href: "#shipping",
  },
  {
    title: "Contact Support",
    description: "Get in touch with our support team",
    icon: Mail,
    href: "/contact",
  },
];

const faqItems = [
  {
    question: "How do I create an account?",
    answer: "Click on the 'Sign Up' button in the navigation menu and fill in your details to create an account.",
  },
  {
    question: "How can I track my order?",
    answer: "You can track your order by visiting the 'Orders' section in your account dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards, debit cards, and popular digital payment methods.",
  },
  {
    question: "How do I return a product?",
    answer: "Visit our Returns & Exchanges page or contact our support team for assistance.",
  },
  {
    question: "Can I change my shipping address after placing an order?",
    answer: "Please contact us as soon as possible if you need to change your shipping address.",
  },
];

export default function HelpPage() {
  return (
    <Suspense fallback={<LoadingPage text="Loading help..." />}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <HelpCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
          <p className="text-muted-foreground">
            Find answers to common questions or contact our support team
          </p>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {helpCategories.map((category) => (
            <Link key={category.title} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{category.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can't find the answer you're looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            Contact Us
          </Link>
        </section>
      </div>
    </Suspense>
  );
}
