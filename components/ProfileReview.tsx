import type { ReactNode } from "react";
import type { CvProfile } from "@/lib/schemas";
import { Button, Card, Chip } from "./ui";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-6">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{title}</h3>
      <div className="mt-2">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-300">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

export default function ProfileReview({
  profile,
  onBack,
  onContinue,
}: {
  profile: CvProfile;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Extracted from your CV</p>
      <h2 className="mt-1 text-xl font-semibold">{profile.name || "Your profile"}</h2>
      {profile.email && <p className="text-sm text-slate-500">{profile.email}</p>}
      {profile.summary && <p className="mt-3 text-slate-700 dark:text-slate-300">{profile.summary}</p>}

      {profile.skills.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((s) => (
              <Chip key={s}>{s}</Chip>
            ))}
          </div>
        </Section>
      )}

      {profile.experience.length > 0 && (
        <Section title="Experience">
          <ul className="space-y-4">
            {profile.experience.map((exp, i) => (
              <li key={i}>
                <p className="font-medium">
                  {exp.title}
                  {exp.company && <span className="text-slate-500"> · {exp.company}</span>}
                </p>
                {exp.duration && <p className="text-xs text-slate-500">{exp.duration}</p>}
                <div className="mt-1">
                  <BulletList items={exp.highlights} />
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {profile.projects.length > 0 && (
        <Section title="Projects">
          <BulletList items={profile.projects} />
        </Section>
      )}

      {profile.education.length > 0 && (
        <Section title="Education">
          <BulletList items={profile.education} />
        </Section>
      )}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button variant="secondary" onClick={onBack}>
          Upload a different CV
        </Button>
        <Button onClick={onContinue}>Looks good, continue</Button>
      </div>
    </Card>
  );
}
