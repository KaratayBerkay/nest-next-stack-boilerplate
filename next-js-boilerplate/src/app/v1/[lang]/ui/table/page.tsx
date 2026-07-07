"use client";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/Tabs";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/Table";


export default function TablePage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <h2 className="text-xl font-bold">Table</h2>
        <p className="text-muted text-sm">A data table component.</p>
      </div>
      <Tabs defaultValue="components">
        <TabsList>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>
        <TabsContent value="components">
          <div className="flex flex-col gap-4">
            <section className="flex flex-col gap-3"><h3 className="text-lg font-semibold">Default</h3><Table><TableCaption>Recent transactions</TableCaption><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Amount</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Alice</TableCell><TableCell>$100</TableCell></TableRow><TableRow><TableCell>Bob</TableCell><TableCell>$50</TableCell></TableRow></TableBody></Table></section>
          </div>
        </TabsContent>
        <TabsContent value="examples">
          <div className="flex flex-col gap-4">
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
