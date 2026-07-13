"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/RadioGroup";

export default function RadioGroupPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Radio Group</h2>
        <p className="text-muted text-sm">
          A set of radio buttons with multiple variants.
        </p>
      </div>

      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="components">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Default</h3>
              <RadioGroup defaultValue="a">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="a" id="a" />
                  <label htmlFor="a">Option A</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="b" id="b" />
                  <label htmlFor="b">Option B</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="c" id="c" />
                  <label htmlFor="c">Option C</label>
                </div>
              </RadioGroup>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Shiny</h3>
              <RadioGroup defaultValue="a" className="text-white">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="a" id="shiny-a" className="border-white/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500" />
                  <label htmlFor="shiny-a" className="text-white">Option A</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="b" id="shiny-b" className="border-white/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500" />
                  <label htmlFor="shiny-b" className="text-white">Option B</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="c" id="shiny-c" className="border-white/30 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:to-purple-500" />
                  <label htmlFor="shiny-c" className="text-white">Option C</label>
                </div>
              </RadioGroup>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Glass</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <RadioGroup defaultValue="a" className="text-white">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="glass-a" className="border-white/20 data-[state=checked]:border-white/50" />
                    <label htmlFor="glass-a" className="text-white">Option A</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="glass-b" className="border-white/20 data-[state=checked]:border-white/50" />
                    <label htmlFor="glass-b" className="text-white">Option B</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="c" id="glass-c" className="border-white/20 data-[state=checked]:border-white/50" />
                    <label htmlFor="glass-c" className="text-white">Option C</label>
                  </div>
                </RadioGroup>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Neon</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <RadioGroup defaultValue="a" className="text-cyan-400">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="neon-a" className="border-cyan-500/30 data-[state=checked]:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                    <label htmlFor="neon-a" className="text-cyan-400">Option A</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="neon-b" className="border-cyan-500/30 data-[state=checked]:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                    <label htmlFor="neon-b" className="text-cyan-400">Option B</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="c" id="neon-c" className="border-cyan-500/30 data-[state=checked]:border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.3)]" />
                    <label htmlFor="neon-c" className="text-cyan-400">Option C</label>
                  </div>
                </RadioGroup>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Gradient</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-4">
                <RadioGroup defaultValue="a">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="a" id="grad-a" className="border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-pink-500" />
                    <label htmlFor="grad-a" className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Option A</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="b" id="grad-b" className="border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-pink-500" />
                    <label htmlFor="grad-b" className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Option B</label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="c" id="grad-c" className="border-transparent data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-blue-500 data-[state=checked]:via-purple-500 data-[state=checked]:to-pink-500" />
                    <label htmlFor="grad-c" className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Option C</label>
                  </div>
                </RadioGroup>
              </div>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="examples">
          <div className="flex flex-col gap-6">
            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Plan Selection</h3>
              <div className="surface max-w-sm space-y-4 p-4">
                <RadioGroup defaultValue="pro" className="space-y-3">
                  {[
                    { value: "free", label: "Free", desc: "$0/mo - Basic features" },
                    { value: "pro", label: "Pro", desc: "$9/mo - Advanced features" },
                    { value: "enterprise", label: "Enterprise", desc: "$29/mo - All features" },
                  ].map((plan) => (
                    <label
                      key={plan.value}
                      htmlFor={`plan-${plan.value}`}
                      className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer has-[:checked]:border-brand has-[:checked]:bg-brand/5 transition-colors"
                    >
                      <RadioGroupItem
                        value={plan.value}
                        id={`plan-${plan.value}`}
                        className="mt-0.5"
                      />
                      <div>
                        <div className="text-sm font-medium">{plan.label}</div>
                        <div className="text-muted text-xs">{plan.desc}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold">Preference Settings</h3>
              <div className="bg-slate-950 p-6 rounded-xl space-y-6">
                <div className="space-y-3">
                  <p className="text-white/70 text-sm font-medium">Theme</p>
                  <RadioGroup defaultValue="dark" className="space-y-2">
                    {["Light", "Dark", "System"].map((theme) => (
                      <div key={theme} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={theme.toLowerCase()}
                          id={`theme-${theme.toLowerCase()}`}
                          className="border-cyan-500/30 data-[state=checked]:border-cyan-400"
                        />
                        <label
                          htmlFor={`theme-${theme.toLowerCase()}`}
                          className="text-cyan-400 text-sm"
                        >
                          {theme}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-3">
                  <p className="text-white/70 text-sm font-medium">Notifications</p>
                  <RadioGroup defaultValue="all" className="space-y-2">
                    {["All", "Important only", "None"].map((pref) => (
                      <div key={pref} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={pref.toLowerCase().replace(" ", "-")}
                          id={`notif-${pref.toLowerCase().replace(" ", "-")}`}
                          className="border-cyan-500/30 data-[state=checked]:border-cyan-400"
                        />
                        <label
                          htmlFor={`notif-${pref.toLowerCase().replace(" ", "-")}`}
                          className="text-cyan-400 text-sm"
                        >
                          {pref}
                        </label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </section>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
