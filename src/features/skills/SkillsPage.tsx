import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { skillLadders } from '../../data/seed';
import { isoDate } from '../../lib/date';
import { useAppState } from '../../store/AppContext';

const skills = ['Muscle-up', 'L-sit', 'Front lever', 'Handstand', 'Planche', 'Weighted pull-up', 'Weighted dip'] as const;

export function SkillsPage() {
  const { activeSkillLogs, saveSkillLogForActive } = useAppState();
  const [form, setForm] = useState<{
    skill: (typeof skills)[number];
    level: string;
    metricValue: string;
    metricUnit: 'seconds' | 'reps' | 'kg';
    note: string;
  }>({ skill: skills[0], level: '', metricValue: '', metricUnit: 'seconds', note: '' });

  return (
    <Layout title="Skills" subtitle="Per-user skill progression and milestone logging.">
      <section className="card space-y-3">
        <select className="input" value={form.skill} onChange={(event) => setForm({ ...form, skill: event.target.value as (typeof skills)[number], level: '' })}>
          {skills.map((skill) => (
            <option key={skill}>{skill}</option>
          ))}
        </select>
        <select className="input" value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value })}>
          <option value="">Select level</option>
          {(skillLadders[form.skill] ?? []).map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" type="number" placeholder="Metric value" value={form.metricValue} onChange={(event) => setForm({ ...form, metricValue: event.target.value })} />
          <select className="input" value={form.metricUnit} onChange={(event) => setForm({ ...form, metricUnit: event.target.value as 'seconds' | 'reps' | 'kg' })}>
            <option value="seconds">seconds</option>
            <option value="reps">reps</option>
            <option value="kg">kg</option>
          </select>
        </div>
        <textarea className="input min-h-[88px]" placeholder="Technique note" value={form.note} onChange={(event) => setForm({ ...form, note: event.target.value })} />
        <button
          type="button"
          className="btn w-full"
          onClick={async () => {
            await saveSkillLogForActive({
              id: crypto.randomUUID(),
              skill: form.skill,
              level: form.level || 'Logged',
              metricValue: form.metricValue ? Number(form.metricValue) : undefined,
              metricUnit: form.metricValue ? form.metricUnit : undefined,
              note: form.note.trim() || undefined,
              date: isoDate()
            });
            setForm({ ...form, level: '', metricValue: '', note: '' });
          }}
        >
          Save skill log
        </button>
      </section>

      {skills.map((skill) => {
        const logs = activeSkillLogs.filter((entry) => entry.skill === skill).sort((left, right) => right.date.localeCompare(left.date)).slice(0, 4);
        return (
          <section key={skill} className="card space-y-2">
            <h2 className="font-semibold">{skill}</h2>
            {logs.length ? (
              logs.map((log) => (
                <p key={log.id} className="text-sm">
                  {log.date}: {log.level}
                  {log.metricValue != null ? ` (${log.metricValue} ${log.metricUnit})` : ''}
                </p>
              ))
            ) : (
              <p className="text-sm text-slate-500">No logs yet.</p>
            )}
          </section>
        );
      })}
    </Layout>
  );
}
