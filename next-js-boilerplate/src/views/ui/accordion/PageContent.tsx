"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionItemComplex,
} from "@/components/ui/Accordion";

export default function AccordionPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Accordion</h2>
        <p className="text-muted text-sm">
          A vertically stacked set of interactive headings with expandable content.
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
        </TabsContent>
        <TabsContent value="examples" className="space-y-6">
          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">FAQ</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItemComplex
                value="faq1"
                trigger="What is this component?"
                triggerFontSize="text-base"
                triggerFontWeight="font-semibold"
                contentFontSize="text-sm"
                contentFontWeight="font-normal"
                upper={
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    General
                  </div>
                }
                content={
                  <div className="space-y-2">
                    <p>An accordion component that organizes content into expandable sections.</p>
                    <p>Click on any trigger to reveal the associated content panel.</p>
                  </div>
                }
              />
              <AccordionItemComplex
                value="faq2"
                trigger="How do I customize it?"
                triggerFontSize="text-base"
                triggerFontWeight="font-semibold"
                contentFontSize="text-sm"
                contentFontWeight="font-normal"
                upper={
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Customization
                  </div>
                }
                content={
                  <div className="space-y-2">
                    <p>Use the global theme switcher in the navbar to change the accordion variant.</p>
                    <p>All accordion components will update automatically to match the selected theme.</p>
                  </div>
                }
              />
              <AccordionItemComplex
                value="faq3"
                trigger="Can I use it with multiple sections open?"
                triggerFontSize="text-base"
                triggerFontWeight="font-semibold"
                contentFontSize="text-sm"
                contentFontWeight="font-normal"
                upper={
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Behavior
                  </div>
                }
                content={
                  <div className="space-y-2">
                    <p>Yes, set the type prop to &quot;multiple&quot; on the Accordion to allow multiple items open simultaneously.</p>
                    <p>For single-expand behavior, use type=&quot;single&quot; with the collapsible prop.</p>
                  </div>
                }
              />
            </Accordion>
          </section>

          <section className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Settings</h3>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItemComplex
                value="settings1"
                trigger="Notification Preferences"
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
                value="settings2"
                trigger="Appearance"
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
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
