import type { Metadata } from "next";
import Link from "next/link";
import credits from "../../scripts/data/image-credits.json";

export const metadata: Metadata = {
  title: "Image credits",
  description: "Licensing and attribution for product photography used in this store.",
};

type Credit = { title: string; license: string; artist: string; sourceUrl: string };

const entries = Object.entries(credits as Record<string, Credit>).sort(([a], [b]) =>
  a.localeCompare(b),
);

const licenses = entries.reduce<Record<string, number>>((accumulator, [, credit]) => {
  accumulator[credit.license] = (accumulator[credit.license] ?? 0) + 1;
  return accumulator;
}, {});

export default function CreditsPage() {
  return (
    <div className="bg-background min-h-screen">
      <div className="container px-4 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Image credits</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Product photography is sourced from Wikimedia Commons. Each file below lists its
          author and licence; where a licence requires attribution or share-alike, the credit
          must travel with the image when it is reused outside this store.
        </p>

        <section className="mt-8">
          <h2 className="text-lg font-semibold">Licences in use</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {Object.entries(licenses)
              .sort(([, a], [, b]) => b - a)
              .map(([license, count]) => (
                <li
                  key={license}
                  className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium"
                >
                  {license} · {count}
                </li>
              ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Per-image attribution</h2>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Image</th>
                  <th className="px-4 py-3">Author</th>
                  <th className="px-4 py-3">Licence</th>
                  <th className="px-4 py-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([filePath, credit]) => (
                  <tr key={filePath} className="border-t border-border align-top">
                    <td className="px-4 py-3 font-mono text-xs">{filePath}</td>
                    <td className="px-4 py-3">{credit.artist || "unknown"}</td>
                    <td className="px-4 py-3">{credit.license}</td>
                    <td className="px-4 py-3">
                      {credit.sourceUrl ? (
                        <a
                          href={credit.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="text-primary hover:underline"
                        >
                          Wikimedia Commons
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <Link href="/" className="mt-10 inline-block text-sm font-semibold text-primary hover:underline">
          Back to store
        </Link>
      </div>
    </div>
  );
}
