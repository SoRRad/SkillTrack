import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/Layout';
import { useAppState } from '../../store/AppContext';
import type { UserOnboarding } from '../../types/models';

const steps = ['Basics', 'Availability', 'Experience', 'Goals', 'Health'];

export function OnboardingPage() {
  const { activeOnboarding, saveOnboardingForActive, activeUser } = useAppState();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<UserOnboarding>(() => activeOnboarding ?? {
    id: 'missing',
    userId: activeUser?.id ?? 'missing',
    basicProfile: {},
    trainingAvailability: {
      daysPerWeek: 3,
      preferredWorkoutDays: ['Mon', 'Wed', 'Fri'],
      sessionLengthMinutes: 60,
      access: 'full-gym',
      availableEquipment: [],
      missingEquipment: []
    },
    experience: {
      level: 'beginner',
      recentTrainingConsistency: 'low'
    },
    goals: {
      muscleGain: 5,
      fatLoss: 5,
      strength: 5,
      calisthenicsSkill: 5,
      mobility: 5,
      athleticPerformance: 3,
      endurance: 3,
      rehab: 1
    },
    skillGoals: {},
    health: {
      movementsToAvoid: []
    },
    nutrition: {},
    lifestyle: {}
  });

  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  return (
    <Layout title="Onboarding" subtitle="Build a local coaching profile for this user.">
      <section className="card space-y-3">
        <div className="flex items-center justify-between">
          <span className="section-title">Progress</span>
          <span className="metric-chip">{progress}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {steps.map((label, index) => (
            <button key={label} type="button" className={`metric-chip ${index === step ? 'bg-brand-100 text-brand-900 dark:bg-brand-950/40 dark:text-brand-100' : ''}`} onClick={() => setStep(index)}>
              {label}
            </button>
          ))}
        </div>
      </section>

      {step === 0 ? (
        <section className="card grid gap-3">
          <input className="input" placeholder="Age" type="number" value={form.basicProfile.age ?? ''} onChange={(event) => setForm({ ...form, basicProfile: { ...form.basicProfile, age: Number(event.target.value) || undefined } })} />
          <select className="input" value={form.basicProfile.sex ?? ''} onChange={(event) => setForm({ ...form, basicProfile: { ...form.basicProfile, sex: event.target.value as UserOnboarding['basicProfile']['sex'] } })}>
            <option value="">Sex</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          <input className="input" placeholder="Height cm" type="number" value={form.basicProfile.heightCm ?? ''} onChange={(event) => setForm({ ...form, basicProfile: { ...form.basicProfile, heightCm: Number(event.target.value) || undefined } })} />
          <input className="input" placeholder="Weight kg" type="number" value={form.basicProfile.weightKg ?? ''} onChange={(event) => setForm({ ...form, basicProfile: { ...form.basicProfile, weightKg: Number(event.target.value) || undefined } })} />
          <select className="input" value={form.basicProfile.activityLevel ?? 'moderate'} onChange={(event) => setForm({ ...form, basicProfile: { ...form.basicProfile, activityLevel: event.target.value as UserOnboarding['basicProfile']['activityLevel'] } })}>
            <option value="low">Low activity</option>
            <option value="moderate">Moderate activity</option>
            <option value="high">High activity</option>
          </select>
        </section>
      ) : null}

      {step === 1 ? (
        <section className="card grid gap-3">
          <input className="input" placeholder="Days per week" type="number" min={2} max={5} value={form.trainingAvailability.daysPerWeek} onChange={(event) => setForm({ ...form, trainingAvailability: { ...form.trainingAvailability, daysPerWeek: Number(event.target.value) || 3 } })} />
          <input className="input" placeholder="Preferred days (comma separated)" value={form.trainingAvailability.preferredWorkoutDays.join(', ')} onChange={(event) => setForm({ ...form, trainingAvailability: { ...form.trainingAvailability, preferredWorkoutDays: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) } })} />
          <input className="input" placeholder="Session length minutes" type="number" value={form.trainingAvailability.sessionLengthMinutes} onChange={(event) => setForm({ ...form, trainingAvailability: { ...form.trainingAvailability, sessionLengthMinutes: Number(event.target.value) || 60 } })} />
          <select className="input" value={form.trainingAvailability.access} onChange={(event) => setForm({ ...form, trainingAvailability: { ...form.trainingAvailability, access: event.target.value as UserOnboarding['trainingAvailability']['access'] } })}>
            <option value="home">Home</option>
            <option value="gym">Gym</option>
            <option value="full-gym">Full gym</option>
          </select>
          <input className="input" placeholder="Available equipment" value={form.trainingAvailability.availableEquipment.join(', ')} onChange={(event) => setForm({ ...form, trainingAvailability: { ...form.trainingAvailability, availableEquipment: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) } })} />
        </section>
      ) : null}

      {step === 2 ? (
        <section className="card grid gap-3">
          <select className="input" value={form.experience.level} onChange={(event) => setForm({ ...form, experience: { ...form.experience, level: event.target.value as UserOnboarding['experience']['level'] } })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input className="input" placeholder="Max pull-ups" type="number" value={form.experience.maxPullUps ?? ''} onChange={(event) => setForm({ ...form, experience: { ...form.experience, maxPullUps: Number(event.target.value) || undefined } })} />
          <input className="input" placeholder="Max chin-ups" type="number" value={form.experience.maxChinUps ?? ''} onChange={(event) => setForm({ ...form, experience: { ...form.experience, maxChinUps: Number(event.target.value) || undefined } })} />
          <input className="input" placeholder="Max dips" type="number" value={form.experience.maxDips ?? ''} onChange={(event) => setForm({ ...form, experience: { ...form.experience, maxDips: Number(event.target.value) || undefined } })} />
          <input className="input" placeholder="Bench working weight kg" type="number" value={form.experience.benchWorkingWeightKg ?? ''} onChange={(event) => setForm({ ...form, experience: { ...form.experience, benchWorkingWeightKg: Number(event.target.value) || undefined } })} />
        </section>
      ) : null}

      {step === 3 ? (
        <section className="card space-y-4">
          {(['muscleGain', 'fatLoss', 'strength', 'calisthenicsSkill', 'mobility', 'athleticPerformance', 'endurance', 'rehab'] as const).map((goal) => (
            <label key={goal} className="block">
              <span className="section-title">{goal}</span>
              <input className="input mt-2" type="number" min={0} max={10} value={form.goals[goal]} onChange={(event) => setForm({ ...form, goals: { ...form.goals, [goal]: Number(event.target.value) || 0 } })} />
            </label>
          ))}
          <input className="input" placeholder="Skill priorities (comma separated)" value={Object.entries(form.skillGoals).filter(([, value]) => (value ?? 0) > 0).map(([key]) => key).join(', ')} onChange={(event) => {
            const next: UserOnboarding['skillGoals'] = {};
            event.target.value.split(',').map((item) => item.trim()).filter(Boolean).forEach((skill, index) => {
              next[skill as keyof UserOnboarding['skillGoals']] = Math.max(1, 10 - index);
            });
            setForm({ ...form, skillGoals: next });
          }} />
        </section>
      ) : null}

      {step === 4 ? (
        <section className="card grid gap-3">
          <textarea className="input min-h-[96px]" placeholder="Injury history or current pain" value={form.health.injuryHistory ?? ''} onChange={(event) => setForm({ ...form, health: { ...form.health, injuryHistory: event.target.value } })} />
          <label className="flex items-center justify-between">
            <span>Shoulder issues</span>
            <input type="checkbox" checked={Boolean(form.health.shoulderIssues)} onChange={(event) => setForm({ ...form, health: { ...form.health, shoulderIssues: event.target.checked } })} />
          </label>
          <label className="flex items-center justify-between">
            <span>Knee issues</span>
            <input type="checkbox" checked={Boolean(form.health.kneeIssues)} onChange={(event) => setForm({ ...form, health: { ...form.health, kneeIssues: event.target.checked } })} />
          </label>
          <label className="flex items-center justify-between">
            <span>Back issues</span>
            <input type="checkbox" checked={Boolean(form.health.backIssues)} onChange={(event) => setForm({ ...form, health: { ...form.health, backIssues: event.target.checked } })} />
          </label>
          <input className="input" placeholder="Movements to avoid" value={form.health.movementsToAvoid.join(', ')} onChange={(event) => setForm({ ...form, health: { ...form.health, movementsToAvoid: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) } })} />
          <input className="input" placeholder="Sleep quality 1-5" type="number" min={1} max={5} value={form.lifestyle.sleepQuality ?? ''} onChange={(event) => setForm({ ...form, lifestyle: { ...form.lifestyle, sleepQuality: Number(event.target.value) as 1 | 2 | 3 | 4 | 5 } })} />
        </section>
      ) : null}

      <section className="sticky bottom-[4.5rem] z-10 grid grid-cols-2 gap-2">
        <button type="button" className="btn-secondary" onClick={() => setStep((current) => Math.max(0, current - 1))}>
          Back
        </button>
        <button
          type="button"
          className="btn"
          onClick={async () => {
            if (step < steps.length - 1) {
              setStep((current) => current + 1);
              return;
            }
            await saveOnboardingForActive(form);
            navigate('/dashboard');
          }}
        >
          {step < steps.length - 1 ? 'Next' : 'Generate plan'}
        </button>
      </section>
    </Layout>
  );
}
