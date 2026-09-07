import Dashboard from "@/components/Dashboard";
import { getActivities } from "@/lib/intervals";

export const revalidate = 300;

export default async function Home() {
  let activities: Awaited<ReturnType<typeof getActivities>> = [];
  let error: string | null = null;

  try {
    activities = await getActivities(90);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erreur inconnue";
  }

  if (error) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-3 px-6 py-24 text-center">
        <h1 className="text-xl font-semibold text-neutral-50">
          Connexion à intervals.icu impossible
        </h1>
        <p className="text-sm text-neutral-500">{error}</p>
        <p className="text-xs text-neutral-600">
          Vérifie les variables d&apos;environnement{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">
            INTERVALS_API_KEY
          </code>{" "}
          et{" "}
          <code className="rounded bg-white/10 px-1 py-0.5">
            INTERVALS_ATHLETE_ID
          </code>
          .
        </p>
      </div>
    );
  }

  return <Dashboard initialActivities={activities} />;
}
