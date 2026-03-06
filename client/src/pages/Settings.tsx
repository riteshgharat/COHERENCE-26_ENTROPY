import { useState } from 'react';
import {
  User,
  Bell,
  Palette,
  Key,
  Save,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useThemeStore } from '@/stores/useThemeStore';

const toneOptions = ['Professional', 'Casual', 'Friendly', 'Formal', 'Conversational'];
const lengthOptions = ['Short', 'Medium', 'Long'];

export default function Settings() {
  const { theme, toggle } = useThemeStore();
  const [selectedTone, setSelectedTone] = useState('Professional');
  const [selectedLength, setSelectedLength] = useState('Medium');
  const [notifications, setNotifications] = useState({
    email: true,
    replies: true,
    bounces: true,
    weekly: false,
  });

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">

      {/* ── Header ── */}
      <div className="pb-6 pt-1">
        <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-[0.18em] mb-1.5">
          OutflowAI • Settings
        </p>
        <h1 className="text-[26px] font-black tracking-tight leading-none">Workspace Preferences</h1>
        <p className="text-[13px] text-muted-foreground mt-1.5">
          Manage your account, profile, integrations, and application behavior.
        </p>
      </div>

      <div className="space-y-4">
        {/* ── Profile settings ── */}
        <div className="rounded-[8px] border-2 border-border bg-card overflow-hidden">
          <div className="bg-muted/10 px-5 py-4 border-b-2 border-border flex items-center gap-2">
            <User size={16} strokeWidth={2} />
            <h2 className="text-[14px] font-extrabold">Profile</h2>
          </div>
          <div className="p-5 space-y-5 bg-card">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">First Name</label>
                <Input defaultValue="Ayush" className="h-10 rounded-[6px] border-2 focus-visible:ring-0 focus-visible:border-foreground/50 font-medium px-3 text-[13px]" />
              </div>
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Last Name</label>
                <Input defaultValue="Choudhar" className="h-10 rounded-[6px] border-2 focus-visible:ring-0 focus-visible:border-foreground/50 font-medium px-3 text-[13px]" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Email Address</label>
              <Input defaultValue="ayush@outflowai.com" className="h-10 rounded-[6px] border-2 focus-visible:ring-0 focus-visible:border-foreground/50 font-medium px-3 text-[13px]" />
            </div>
            <div>
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Company Name</label>
              <Input defaultValue="OutflowAI" className="h-10 rounded-[6px] border-2 focus-visible:ring-0 focus-visible:border-foreground/50 font-medium px-3 text-[13px]" />
            </div>
          </div>
        </div>

        {/* ── AI Personalization ── */}
        <div className="rounded-[8px] border-2 border-border bg-card overflow-hidden">
          <div className="bg-muted/10 px-5 py-4 border-b-2 border-border flex items-center gap-2">
            <Sparkles size={16} strokeWidth={2} />
            <h2 className="text-[14px] font-extrabold">Default AI Personalization</h2>
          </div>
          <div className="p-5 flex flex-col md:flex-row gap-8 bg-card">
            <div className="flex-1 space-y-6">
              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-3">Copywriting Tone</label>
                <div className="flex flex-wrap gap-2">
                  {toneOptions.map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone)}
                      className={`px-3 py-1.5 rounded-[5px] text-[11px] font-bold border-2 transition-all ${
                        selectedTone === tone
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-3">Message Length</label>
                <div className="flex gap-2 w-full max-w-sm">
                  {lengthOptions.map((length) => (
                    <button
                      key={length}
                      onClick={() => setSelectedLength(length)}
                      className={`flex-1 px-3 py-2 rounded-[5px] text-[11px] font-bold border-2 transition-all ${
                        selectedLength === length
                          ? 'bg-foreground text-background border-foreground'
                          : 'bg-background text-muted-foreground border-border hover:border-foreground/40 hover:text-foreground'
                      }`}
                    >
                      {length}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 md:border-l-2 border-border md:pl-8">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-3">Fallback Content (Global)</label>
              <textarea
                className="w-full bg-muted/40 border-2 border-border rounded-[6px] px-3 py-2 text-[12px] font-medium focus:outline-none focus:border-foreground/40 transition-colors resize-none h-32"
                readOnly
                defaultValue={`Hi {{name}},

I noticed {{company}} is growing fast in the {{industry}} space. Would love to share how OutflowAI can help scale your outreach.

Best,
Ayush`}
              />
            </div>
          </div>
        </div>

        {/* ── Settings grid (Appearance & Notifications) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Appearance */}
          <div className="rounded-[8px] border-2 border-border bg-card overflow-hidden">
            <div className="bg-muted/10 px-4 py-3 border-b-2 border-border flex items-center gap-2">
              <Palette size={15} strokeWidth={2.5} />
              <h2 className="text-[13px] font-extrabold">Appearance</h2>
            </div>
            <div className="p-4 bg-card h-[180px]">
              <div className="flex items-center justify-between p-3 rounded-[6px] border-2 border-border bg-muted/20">
                <div>
                  <div className="text-[13px] font-bold">Dark Mode</div>
                  <div className="text-[11px] font-medium text-muted-foreground mt-0.5">Toggle interface theme</div>
                </div>
                <Switch checked={theme === 'dark'} onCheckedChange={toggle} />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-[8px] border-2 border-border bg-card overflow-hidden">
            <div className="bg-muted/10 px-4 py-3 border-b-2 border-border flex items-center gap-2">
              <Bell size={15} strokeWidth={2.5} />
              <h2 className="text-[13px] font-extrabold">Notifications</h2>
            </div>
            <div className="p-4 bg-card flex flex-col gap-2 h-[180px] overflow-auto">
              {[
                { key: 'email', label: 'Email notifications', desc: 'When campaigns are sent' },
                { key: 'replies', label: 'Reply alerts', desc: 'When a lead responds' },
                { key: 'bounces', label: 'Bounce alerts', desc: 'When emails fail delivery' },
                { key: 'weekly', label: 'Weekly digest', desc: 'Performance summary' },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-bold leading-tight">{item.label}</div>
                    <div className="text-[10px] font-medium text-muted-foreground">{item.desc}</div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                    }
                    className="scale-75 origin-right"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── Developer API ── */}
        <div className="rounded-[8px] border-2 border-border bg-card overflow-hidden">
          <div className="bg-muted/10 px-5 py-4 border-b-2 border-border flex items-center gap-2">
            <Key size={16} strokeWidth={2} />
            <h2 className="text-[14px] font-extrabold">API & Webhooks</h2>
          </div>
          <div className="p-5 flex flex-col md:flex-row gap-5 bg-card">
            <div className="flex-1">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Secret API Key</label>
              <div className="flex items-center gap-2">
                <Input defaultValue="sk-outflow-••••••••••••••••••••" className="h-10 rounded-[6px] border-2 font-mono text-[11px] font-bold text-muted-foreground bg-muted/30" readOnly />
                <Button variant="outline" className="h-10 border-2 rounded-[6px] text-[12px] font-bold shrink-0">
                  Rotate key
                </Button>
              </div>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-2">Global Webhook URL</label>
              <Input placeholder="https://your-server.com/webhook" className="h-10 rounded-[6px] border-2 focus-visible:ring-0 focus-visible:border-foreground/50 font-medium px-3 text-[13px]" />
            </div>
          </div>
        </div>

      </div>

      {/* ── Form Actions ── */}
      <div className="flex justify-end pt-6 pb-2">
        <Button className="gap-2 h-10 px-6 rounded-[6px] text-[13px] font-bold">
          <Save size={14} />
          Save Preferences
        </Button>
      </div>

    </div>
  );
}
