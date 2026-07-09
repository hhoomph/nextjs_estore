import { Metadata } from "next";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Privacy Policy",
    description: "Our privacy policy explains how we collect, use, and protect your personal information.",
  };
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("Legal.privacyPolicy");

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{t("title")}</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("lastUpdated")}</h2>
          <p className="text-muted-foreground">{t("lastUpdatedText")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("informationWeCollect.title")}</h2>
          <p>{t("informationWeCollect.description")}</p>
          <ul className="list-disc pl-6 space-y-2 mt-2">
            <li>{t("informationWeCollect.items.personal")}</li>
            <li>{t("informationWeCollect.items.usage")}</li>
            <li>{t("informationWeCollect.items.cookies")}</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("howWeUse.title")}</h2>
          <p>{t("howWeUse.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("dataProtection.title")}</h2>
          <p>{t("dataProtection.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("yourRights.title")}</h2>
          <p>{t("yourRights.description")}</p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">{t("contact.title")}</h2>
          <p>{t("contact.description")}</p>
        </section>
      </div>
    </div>
  );
}
