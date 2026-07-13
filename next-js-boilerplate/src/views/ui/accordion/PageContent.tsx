"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionShiny,
  AccordionGlass,
  AccordionNeon,
  AccordionGradient,
  AccordionItemComplex,
  AccordionUpperSection,
} from "@/components/ui/Accordion";

export default function AccordionPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Accordion</h2>
        <p className="text-muted text-sm">
          A vertically stacked set of interactive headings with multiple stylish variants.
        </p>
      </div>
      <Tabs defaultValue="components">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Default</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="1">
                <AccordionTrigger>Is it accessible?</AccordionTrigger>
                <AccordionContent>
                  Yes. It adheres to WAI-ARIA standards and is fully keyboard navigable.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="2">
                <AccordionTrigger>Is it styled?</AccordionTrigger>
                <AccordionContent>
                  Yes. It comes with default styles that integrate seamlessly with your design system.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="3">
                <AccordionTrigger>Is it animated?</AccordionTrigger>
                <AccordionContent>
                  Yes. It features smooth expand/collapse animations with cubic-bezier easing.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Shiny Variant</h3>
            <AccordionShiny className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItem value="1" variant="shiny">
                  <AccordionTrigger variant="shiny">✨ Shiny Border Effect</AccordionTrigger>
                  <AccordionContent variant="shiny">
                    Features a subtle gradient overlay and border glow that creates a premium,
                    polished look with smooth transitions on hover.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" variant="shiny">
                  <AccordionTrigger variant="shiny">💎 Premium Appearance</AccordionTrigger>
                  <AccordionContent variant="shiny">
                    The shiny variant adds depth with layered gradients and subtle reflections
                    that catch the light dynamically.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" variant="shiny">
                  <AccordionTrigger variant="shiny">🚀 Smooth Animations</AccordionTrigger>
                  <AccordionContent variant="shiny">
                    All interactions are buttery smooth with optimized CSS transitions
                    for pixel-perfect animations.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionShiny>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Glass Variant</h3>
            <AccordionGlass className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItem value="1" variant="glass">
                  <AccordionTrigger variant="glass">🪟 Frosted Glass Effect</AccordionTrigger>
                  <AccordionContent variant="glass">
                    Uses backdrop-blur to create a modern frosted glass aesthetic that
                    blurs content behind the component.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" variant="glass">
                  <AccordionTrigger variant="glass">✨ Translucent Layers</AccordionTrigger>
                  <AccordionContent variant="glass">
                    Multiple translucent layers create depth and dimension with a lightweight,
                    airy feel.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" variant="glass">
                  <AccordionTrigger variant="glass">💎 Modern UI Pattern</AccordionTrigger>
                  <AccordionContent variant="glass">
                    Follows current design trends with semi-transparent backgrounds and
                    elegant border treatments.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionGlass>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Neon Variant</h3>
            <AccordionNeon className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItem value="1" variant="neon">
                  <AccordionTrigger variant="neon">⚡ Neon Glow Effect</AccordionTrigger>
                  <AccordionContent variant="neon">
                    Features electric cyan and purple neon glow that pulses subtly on hover,
                    creating an energetic, modern feel.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" variant="neon">
                  <AccordionTrigger variant="neon">🌈 Animated Borders</AccordionTrigger>
                  <AccordionContent variant="neon">
                    Borders animate with gradient shifts and glow effects that respond to
                    user interactions in real-time.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" variant="neon">
                  <AccordionTrigger variant="neon">🎮 Cyberpunk Aesthetic</AccordionTrigger>
                  <AccordionContent variant="neon">
                    Perfect for tech-forward interfaces with a cyberpunk or futuristic
                    design language.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionNeon>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Gradient Variant</h3>
            <AccordionGradient className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItem value="1" variant="gradient">
                  <AccordionTrigger variant="gradient">🎨 Multi-Color Gradient</AccordionTrigger>
                  <AccordionContent variant="gradient">
                    Features a stunning blue-to-purple-to-pink gradient background that
                    creates depth and visual interest.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="2" variant="gradient">
                  <AccordionTrigger variant="gradient">✨ Gradient Border Glow</AccordionTrigger>
                  <AccordionContent variant="gradient">
                    Animated gradient borders that shift and pulse, creating a dynamic
                    visual effect that draws attention.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="3" variant="gradient">
                  <AccordionTrigger variant="gradient">🚀 Premium Shadow Depth</AccordionTrigger>
                  <AccordionContent variant="gradient">
                    Multi-layered shadows with gradient glows create incredible depth
                    and a premium, elevated appearance.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </AccordionGradient>
          </section>
        </TabsContent>
        <TabsContent value="examples" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Complex Accordion (Shiny)</h3>
            <AccordionShiny className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItemComplex
                  value="complex1"
                  variant="shiny"
                  trigger="Project Management"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-semibold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category: Productivity
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Manage your projects with our comprehensive tool.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Create and organize projects</li>
                        <li>Assign tasks to team members</li>
                        <li>Set deadlines and milestones</li>
                      </ul>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="complex2"
                  variant="shiny"
                  trigger="Team Collaboration"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-semibold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category: Team
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Work together seamlessly with your team members.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Real-time chat and comments</li>
                        <li>Shared workspaces</li>
                        <li>File sharing and collaboration</li>
                      </ul>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="complex3"
                  variant="shiny"
                  trigger="Analytics & Reports"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-semibold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Category: Analytics
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Get insights with our advanced analytics.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Real-time dashboards</li>
                        <li>Custom report builder</li>
                        <li>Export data in multiple formats</li>
                      </ul>
                    </div>
                  }
                />
              </Accordion>
            </AccordionShiny>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Complex Accordion (Neon)</h3>
            <AccordionNeon className="w-full">
              <Accordion type="multiple" className="w-full">
                <AccordionItemComplex
                  value="neon1"
                  variant="neon"
                  trigger="Real-time Analytics"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-cyan-500 uppercase tracking-wider">
                      Feature
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Monitor your data in real-time with our advanced analytics dashboard.</p>
                      <p>Track metrics, set up custom alerts, and gain insights instantly.</p>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="neon2"
                  variant="neon"
                  trigger="AI-Powered Insights"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-purple-500 uppercase tracking-wider">
                      Feature
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Leverage machine learning to uncover patterns in your data.</p>
                      <p>Our AI assistant helps you make data-driven decisions with actionable recommendations.</p>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="neon3"
                  variant="neon"
                  trigger="Team Collaboration"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-pink-500 uppercase tracking-wider">
                      Feature
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Work together seamlessly with your team.</p>
                      <p>Share dashboards, comment on metrics, and collaborate on insights in real-time.</p>
                    </div>
                  }
                />
              </Accordion>
            </AccordionNeon>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Complex Accordion (Glass)</h3>
            <AccordionGlass className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItemComplex
                  value="glass1"
                  variant="glass"
                  trigger="Notifications Settings"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-semibold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Privacy & Security
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Manage how you receive notifications from the platform.</p>
                      <p>Choose between email, push notifications, or in-app alerts for different types of updates.</p>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="glass2"
                  variant="glass"
                  trigger="Appearance Preferences"
                  triggerFontSize="text-base"
                  triggerFontWeight="font-semibold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Customization
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Customize the look and feel of the application.</p>
                      <p>Theme preferences, font size options, and layout adjustments to suit your needs.</p>
                    </div>
                  }
                />
              </Accordion>
            </AccordionGlass>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Complex Accordion (Gradient)</h3>
            <AccordionGradient className="w-full">
              <Accordion type="single" collapsible>
                <AccordionItemComplex
                  value="gradient1"
                  variant="gradient"
                  trigger="Starter Plan"
                  triggerFontSize="text-lg"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">
                      Plan
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Perfect for individuals and small projects.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>5 projects included</li>
                        <li>1GB storage</li>
                        <li>Community support</li>
                      </ul>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="gradient2"
                  variant="gradient"
                  trigger="Pro Plan"
                  triggerFontSize="text-lg"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">
                      Plan
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>For growing teams and businesses.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>20 projects included</li>
                        <li>10GB storage</li>
                        <li>Priority support</li>
                        <li>Advanced analytics</li>
                      </ul>
                    </div>
                  }
                />
                <AccordionItemComplex
                  value="gradient3"
                  variant="gradient"
                  trigger="Enterprise"
                  triggerFontSize="text-lg"
                  triggerFontWeight="font-bold"
                  contentFontSize="text-sm"
                  contentFontWeight="font-normal"
                  upper={
                    <div className="text-xs font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent uppercase tracking-wider">
                      Plan
                    </div>
                  }
                  content={
                    <div className="space-y-2">
                      <p>Full-featured solution for large organizations.</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Unlimited projects</li>
                        <li>Unlimited storage</li>
                        <li>Dedicated account manager</li>
                        <li>Custom integrations</li>
                      </ul>
                    </div>
                  }
                />
              </Accordion>
            </AccordionGradient>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
