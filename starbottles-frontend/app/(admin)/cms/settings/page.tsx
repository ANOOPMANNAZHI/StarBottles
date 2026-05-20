"use client";

import { useState, useEffect } from "react";
import { useSiteSettings, useBulkUpdateSettings, type SiteSetting } from "@/hooks/useCms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, AlertCircle, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const GROUP_LABELS: Record<string, string> = {
  general: "General",
  contact: "Contact",
  social: "Social Media",
  footer: "Footer",
  erp: "ERP",
};

const ERP_EDITABLE_KEYS = ["erp_sync_interval"];
const ERP_MASKED_KEYS = ["erp_api_key", "erp_api_secret"];

const FIELD_LABELS: Record<string, string> = {
  company_name: "Company Name",
  company_tagline: "Tagline",
  logo_path: "Logo Path",
  contact_email: "Email Address",
  contact_phone: "Phone Number",
  whatsapp_number: "WhatsApp Number",
  address: "Office Address",
  facebook_url: "Facebook URL",
  instagram_url: "Instagram URL",
  linkedin_url: "LinkedIn URL",
  twitter_url: "Twitter / X URL",
  footer_text: "Footer Text",
  footer_logo_path: "Footer Logo Path",
  b2b_base_url: "B2B Website URL",
};

const FIELD_HINTS: Record<string, string> = {
  company_name: "The official company name displayed in the header and metadata",
  company_tagline: "A short slogan or description shown below the company name",
  logo_path: "URL or path to the main logo image (e.g. /logo.png)",
  contact_email: "Primary contact email shown on the Contact page",
  contact_phone: "Phone number with country code (e.g. +91 98765 43210)",
  whatsapp_number: "WhatsApp number for the chat widget (digits only)",
  address: "Full office address shown on the Contact page",
  facebook_url: "Full URL to your Facebook page",
  instagram_url: "Full URL to your Instagram profile",
  linkedin_url: "Full URL to your LinkedIn company page",
  twitter_url: "Full URL to your Twitter/X profile",
  footer_text: "Copyright text or tagline in the footer",
  footer_logo_path: "URL or path to the footer logo (if different from main logo)",
  b2b_base_url: "Base URL of the B2B website (e.g. https://b2b.starbottles.com). Product share links will point here.",
};

export default function SiteSettingsPage() {
  const { data: grouped, isLoading } = useSiteSettings();
  const bulkUpdate = useBulkUpdateSettings();
  const [values, setValues] = useState<Record<string, string>>({});
  const [savedValues, setSavedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!grouped) return;
    const flat: Record<string, string> = {};
    Object.values(grouped).flat().forEach((s: SiteSetting) => {
      flat[s.key] = s.value ?? "";
    });
    setValues(flat);
    setSavedValues(flat);
  }, [grouped]);

  const hasChanges = JSON.stringify(values) !== JSON.stringify(savedValues);

  const handleSave = async () => {
    const settings = Object.entries(values).map(([key, value]) => ({ key, value: value || null }));
    await bulkUpdate.mutateAsync(settings);
    setSavedValues({ ...values });
    toast.success("Settings saved");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 size={24} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groups = Object.keys(grouped ?? {});

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure company info, contact details, and social links.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {hasChanges && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
              <AlertCircle size={13} />
              Unsaved changes
            </div>
          )}
          <Button onClick={handleSave} disabled={bulkUpdate.isPending || !hasChanges}>
            {bulkUpdate.isPending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Save size={16} className="mr-2" />}
            Save All
          </Button>
        </div>
      </div>

      <Tabs defaultValue={groups[0] ?? "general"}>
        <TabsList className="w-full justify-start">
          {groups.map((g) => (
            <TabsTrigger key={g} value={g}>{GROUP_LABELS[g] ?? g}</TabsTrigger>
          ))}
        </TabsList>

        {groups.map((g) => (
          <TabsContent key={g} value={g} className="mt-4">
            <Card className="border-border/60 divide-y divide-border/60">
              {(grouped?.[g] ?? []).map((setting: SiteSetting) => {
                const isErpGroup = g === "erp";
                const isEditable = !isErpGroup || ERP_EDITABLE_KEYS.includes(setting.key);
                const isMasked = isErpGroup && ERP_MASKED_KEYS.includes(setting.key);
                return (
                  <div key={setting.key} className={cn("p-4 space-y-2", !isEditable && "bg-muted/30")}>
                    <div>
                      <label className="text-sm font-medium flex items-center gap-1.5">
                        {FIELD_LABELS[setting.key] ?? setting.key}
                        {!isEditable && <Lock size={11} className="text-muted-foreground" />}
                      </label>
                      {FIELD_HINTS[setting.key] && isEditable && (
                        <p className="text-xs text-muted-foreground mt-0.5">{FIELD_HINTS[setting.key]}</p>
                      )}
                    </div>
                    {setting.type === "textarea" ? (
                      <Textarea
                        value={values[setting.key] ?? ""}
                        onChange={(e) => isEditable && setValues({ ...values, [setting.key]: e.target.value })}
                        readOnly={!isEditable}
                        rows={3}
                        className={cn("resize-none", !isEditable && "bg-muted text-muted-foreground cursor-not-allowed select-none")}
                      />
                    ) : (
                      <Input
                        type={isMasked ? "password" : "text"}
                        value={isMasked ? "••••••••••••" : (values[setting.key] ?? "")}
                        onChange={(e) => isEditable && setValues({ ...values, [setting.key]: e.target.value })}
                        readOnly={!isEditable}
                        className={cn(!isEditable && "bg-muted text-muted-foreground cursor-not-allowed select-none")}
                      />
                    )}
                  </div>
                );
              })}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Sticky save bar when there are changes */}
      {hasChanges && (
        <div className="sticky bottom-6 flex justify-end">
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-border/60 rounded-xl shadow-lg">
            <span className="text-sm text-muted-foreground">You have unsaved changes</span>
            <Button size="sm" onClick={handleSave} disabled={bulkUpdate.isPending}>
              {bulkUpdate.isPending ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Save size={14} className="mr-1.5" />}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
