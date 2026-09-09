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
import { getTranslations } from "next-intl/server";

const helpCategories = [
  {
    titleKey: "categories.gettingStarted.title",
    descriptionKey: "categories.gettingStarted.description",
    icon: Book,
    href: "#getting-started",
  },
  {
    titleKey: "categories.shopping.title",
    descriptionKey: "categories.shopping.description",
    icon: ShoppingCart,
    href: "#shopping",
  },
  {
    titleKey: "categories.account.title",
    descriptionKey: "categories.account.description",
    icon: User,
    href: "#account",
  },
  {
    titleKey: "categories.payment.title",
    descriptionKey: "categories.payment.description",
    icon: CreditCard,
    href: "#payment",
  },
  {
    titleKey: "categories.shipping.title",
    descriptionKey: "categories.shipping.description",
    icon: Truck,
    href: "#shipping",
  },
  {
    titleKey: "categories.contactSupport.title",
    descriptionKey: "categories.contactSupport.description",
    icon: Mail,
    href: "/contact",
  },
];

const faqKeys = [
  { q: "faqs.q1", a: "faqs.a1" },
  { q: "faqs.q2", a: "faqs.a2" },
  { q: "faqs.q3", a: "faqs.a3" },
  { q: "faqs.q4", a: "faqs.a4" },
  { q: "faqs.q5", a: "faqs.a5" },
];

export default async function HelpPage() {
  const t = await getTranslations("Help") as (key: string) => string;

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
          <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {helpCategories.map((category) => (
            <Link key={category.titleKey} href={category.href}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <category.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{t(category.titleKey as string)}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {t(category.descriptionKey as string)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQ Section */}
        <section id="faq" className="mb-12">
          <h2 className="text-2xl font-bold mb-6">{t("faqs.title")}</h2>
          <div className="space-y-4">
            {faqKeys.map((item) => (
              <Card key={item.q}>
                <CardHeader>
                  <CardTitle className="text-lg">{t(item.q as string)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{t(item.a as string)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t("contactCTA.title")}</h2>
          <p className="text-muted-foreground mb-6">
            {t("contactCTA.description")}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            {t("contactCTA.button")}
          </Link>
        </section>
      </div>
    </Suspense>
  );
}


