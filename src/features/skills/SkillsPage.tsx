import { useState } from 'react';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import { isoDate } from '../../lib/date';
import { skillLadders } from '../../data/seed';
import type { SkillLog } from '../../types/models';

const skills: SkillLog['skill'][] = ['Muscle-up', 'L-sit', 'Front lever', 'Handstand', 'Planche'];

export function SkillsPage() {
  const { skillLogs, addSkillLog } = useAppState();
  const [form, setForm] = useState<{
    skill: SkillLog['skill'];
    level: string;
    metricValue: string;
    metricUnit: string;
    note: string;
  }>({ skill: 'Muscle-up', level: '', metricValue: '', metricUnit: 'seconds', note: '' });

  return (
    <Layout title="Skills" subtitle="Skill ladders and history">
      <section className="card space-y-2">
        <h2 className="font-semibold">Log skill progression</h2>
        <select className="input" value={form.skill} onChange={(e) => setForm((prev) => ({ ...prev, skill: e.target.value as SkillLog['skill'] }))}>
          {skills.map((skill) => (
            <option key={skill}>{skill}</option>
          ))}
        </select>
        <select className="input" value={form.level} onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}>
          <option value="">Select level</option>
          {(skillLadders[form.skill] ?? []).map((level) => (
            <option key={level}>{level}</option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-2">
          <input className="input" placeholder="seconds/reps" type="number" value={form.metricValue} onChange={(e) => setForm((prev) => ({ ...prev, metricValue: e.target.value }))} />
          <select className="input" value={form.metricUnit} onChange={(e) => setForm((prev) => ({ ...prev, metricUnit: e.target.value }))}>
            <option value="seconds">seconds</option>
            <option value="reps">reps</option>
          </select>
        </div>
        <textarea className="input" placeholder="note" value={form.note} onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))} />
        <button
          className="btn"
          onClick={() =>
            addSkillLog({
              id: crypto.randomUUID(),
              skill: form.skill,
              level: form.level || 'Unspecified',
              metricValue: form.metricValue ? Number(form.metricValue) : undefined,
              metricUnit: form.metricValue ? (form.metricUnit as 'seconds' | 'reps') : undefined,
              note: form.note || undefined,
              date: isoDate()
            })
          }
        >
          Save skill log
        </button>
      </section>

      {skills.map((skill) => {
        const logs = skillLogs.filter((l) => l.skill === skill).slice().sort((a, b) => b.date.localeCompare(a.date));
        const latest = logs[0];
        return (
          <section key={skill} className="card space-y-1">
            <h3 className="font-semibold">{skill}</h3>
            <p className="text-sm">Current: {latest?.level ?? 'Not logged'}</p>
            {logs.slice(0, 4).map((log) => (
              <p key={log.id} className="text-xs text-slate-500">
                {log.date}: {log.level} {log.metricValue ? `(${log.metricValue} ${log.metricUnit})` : ''}
              </p>
            ))}
          </section>
        );
      })}
    </Layout>
  );
}
