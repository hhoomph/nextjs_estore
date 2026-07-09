import { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Terms & Conditions",
    description: "The terms and conditions governing your use of our e-commerce platform.",
  };
}

export default function TermsConditionsPage() {
  const t = useTranslations("Legal.termsConditions");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("acceptance.title")}</h2>
          <p>{t("acceptance.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("useLicense.title")}</h2>
          <p>{t("useLicense.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("orders.title")}</h2>
          <p>{t("orders.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("pricing.title")}</h2>
          <p>{t("pricing.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("limitation.title")}</h2>
          <p>{t("limitation.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("governingLaw.title")}</h2>
          <p>{t("governingLaw.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
          <p>{t("contact.description")}</p>
        </section>
      </div>
    </div>
  );
}
