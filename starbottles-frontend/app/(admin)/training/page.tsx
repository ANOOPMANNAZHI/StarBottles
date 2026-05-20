"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useDropzone } from "react-dropzone";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown, Trash2, Plus, Upload, BarChart2, Users,
  Building2, FileText, Video, ClipboardCheck,
  GripVertical, FileUp, Loader2, Eye,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  useTrainingMaterials,
  useUploadMaterial,
  useDeleteMaterial,
  useUpdateCompanyInfo,
  useCompanyInfo,
  CompanyInfoSection,
  TrainingMaterialItem,
} from "@/hooks/useTraining";
import { useAdminQuizzes } from "@/hooks/useQuiz";
import AssignQuizModal from "@/components/training/AssignQuizModal";
import QuizResultsPanel from "@/components/training/QuizResultsPanel";
import { cn } from "@/lib/utils";

const RichTextEditor = dynamic(() => import("@/components/training/RichTextEditor"), {
  ssr: false,
  loading: () => <div className="h-40 rounded-lg border border-input bg-muted/30 animate-pulse" />,
});
const QuizBuilderModal = dynamic(() => import("@/components/training/QuizBuilderModal"));

// ── Overview stat cards ─────────────────────────────────────────────────────
function OverviewStats() {
  const { data: materials, isLoading: matLoading } = useTrainingMaterials();
  const { data: sections, isLoading: secLoading } = useCompanyInfo();
  const { data: quizData, isLoading: quizLoading } = useAdminQuizzes();

  const stats = [
    {
      label: "Company Sections",
      value: sections?.length ?? 0,
      icon: Building2,
      gradient: "from-[oklch(0.58_0.20_218)] to-[oklch(0.48_0.18_228)]",
      bg: "bg-[oklch(0.58_0.20_218)]/8",
      color: "text-[oklch(0.45_0.18_218)]",
      loading: secLoading,
    },
    {
      label: "PDFs & Documents",
      value: (materials?.pdfs?.length ?? 0) + (materials?.documents?.length ?? 0),
      icon: FileText,
      gradient: "from-[oklch(0.64_0.19_162)] to-[oklch(0.54_0.17_172)]",
      bg: "bg-[oklch(0.64_0.19_162)]/8",
      color: "text-[oklch(0.48_0.17_162)]",
      loading: matLoading,
    },
    {
      label: "Training Videos",
      value: materials?.videos?.length ?? 0,
      icon: Video,
      gradient: "from-[oklch(0.65_0.20_30)] to-[oklch(0.55_0.18_20)]",
      bg: "bg-[oklch(0.65_0.20_30)]/8",
      color: "text-[oklch(0.50_0.18_30)]",
      loading: matLoading,
    },
    {
      label: "Active Quizzes",
      value: quizData?.data?.length ?? 0,
      icon: ClipboardCheck,
      gradient: "from-[oklch(0.56_0.22_270)] to-[oklch(0.46_0.20_280)]",
      bg: "bg-[oklch(0.56_0.22_270)]/8",
      color: "text-[oklch(0.44_0.20_270)]",
      loading: quizLoading,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <Card key={s.label} className="relative overflow-hidden border-0 shadow-sm">
          <div className={cn("absolute inset-0 opacity-[0.03] bg-gradient-to-br", s.gradient)} />
          <CardContent className="relative p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  {s.label}
                </p>
                {s.loading ? (
                  <Skeleton className="h-8 w-12 mt-1.5" />
                ) : (
                  <p className="text-2xl font-bold tracking-tight text-foreground mt-1 tabular-nums">
                    {s.value}
                  </p>
                )}
              </div>
              <div className={cn("flex items-center justify-center w-9 h-9 rounded-xl", s.bg)}>
                <s.icon size={16} className={s.color} strokeWidth={1.75} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Company Info Section ────────────────────────────────────────────────────
function SectionItem({
  section,
  isOpen,
  onOpenChange,
  index,
}: {
  section: CompanyInfoSection;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  index: number;
}) {
  const mutation = useUpdateCompanyInfo(section.section_key);
  const [draft, setDraft] = useState({ title: section.title, content: section.content });

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full flex items-center gap-3 bg-card border rounded-xl px-5 py-4 hover:bg-muted/20 transition-all duration-200 group">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-muted/60 text-xs font-bold text-muted-foreground shrink-0">
          {index + 1}
        </div>
        <span className="font-medium text-sm flex-1 text-left">{section.title}</span>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </CollapsibleTrigger>
      <CollapsibleContent className="border border-t-0 rounded-b-xl bg-card px-5 pb-5 pt-4 space-y-4 -mt-1">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Section Title</label>
          <Input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            className="bg-background"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Content</label>
          <RichTextEditor
            value={draft.content}
            onChange={(html) => setDraft((p) => ({ ...p, content: html }))}
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-xs"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={mutation.isPending}
            className="text-xs gap-1.5"
            onClick={async () => {
              try {
                await mutation.mutateAsync({
                  title: draft.title,
                  content: draft.content,
                  display_order: section.display_order,
                });
                toast.success("Section saved successfully");
                onOpenChange(false);
              } catch {
                toast.error("Failed to save section");
              }
            }}
          >
            {mutation.isPending && <Loader2 size={12} className="animate-spin" />}
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CompanyInfoTab() {
  const { data: sections, isLoading } = useCompanyInfo();
  const [openKey, setOpenKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!sections || sections.length === 0) {
    return (
      <div className="rounded-2xl border bg-card shadow-sm py-16 text-center">
        <Building2 size={40} className="mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
        <p className="font-medium text-foreground">No company sections yet</p>
        <p className="text-sm text-muted-foreground mt-1">Company info sections will appear here once created.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Edit the content trainees see when learning about your company. Click a section to expand and edit.
      </p>
      {sections.map((section: CompanyInfoSection, i: number) => (
        <SectionItem
          key={section.id}
          section={section}
          index={i}
          isOpen={openKey === section.section_key}
          onOpenChange={(open) => setOpenKey(open ? section.section_key : null)}
        />
      ))}
    </div>
  );
}

// ── Materials Upload Tab ────────────────────────────────────────────────────
function MaterialsTab({ type }: { type: "pdf" | "document" | "video" }) {
  const { data, isLoading } = useTrainingMaterials();
  const uploadMaterial = useUploadMaterial();
  const deleteMaterial = useDeleteMaterial();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);

  const items: TrainingMaterialItem[] =
    type === "pdf" ? (data?.pdfs ?? []) : type === "video" ? (data?.videos ?? []) : (data?.documents ?? []);

  const typeLabel = type === "pdf" ? "PDF Document" : type === "video" ? "Video" : "Document";
  const typeIcon = type === "video" ? Video : FileText;
  const TypeIcon = typeIcon;

  const onDrop = useCallback(
    async (files: File[]) => {
      if (!files[0] || !title.trim()) {
        toast.error("Please enter a title before uploading");
        return;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", files[0]);
        fd.append("title", title.trim());
        fd.append("type", type);
        if (description.trim()) fd.append("description", description.trim());
        await uploadMaterial.mutateAsync(fd);
        toast.success(`${typeLabel} uploaded successfully`);
        setTitle("");
        setDescription("");
      } catch {
        toast.error("Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [title, description, type, uploadMaterial, typeLabel]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false });

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <Card className="border shadow-sm overflow-hidden">
        <CardContent className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
              <FileUp size={15} className="text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Upload {typeLabel}</h3>
              <p className="text-xs text-muted-foreground">Add a new {type} to the training library</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <Input
              placeholder="Title (required)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background text-sm"
            />
            <Input
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background text-sm"
            />
          </div>

          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200",
              isDragActive
                ? "border-accent bg-accent/5 scale-[1.01]"
                : "border-border/60 hover:border-accent/40 hover:bg-muted/20"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              {uploading ? (
                <>
                  <Loader2 size={28} className="text-accent animate-spin" />
                  <p className="text-sm font-medium text-foreground">Uploading...</p>
                </>
              ) : isDragActive ? (
                <>
                  <Upload size={28} className="text-accent" />
                  <p className="text-sm font-medium text-accent">Drop the file here</p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-muted/60 flex items-center justify-center">
                    <Upload size={20} className="text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Drag & drop or <span className="text-accent font-semibold">browse</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {type === "video" ? "MP4, WebM, or video URL" : "PDF, DOC, DOCX up to 10MB"}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Existing materials */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-sm py-14 text-center">
          <TypeIcon size={36} className="mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
          <p className="font-medium text-foreground">No {type}s uploaded yet</p>
          <p className="text-sm text-muted-foreground mt-1">Upload your first {type} above to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium text-muted-foreground">{items.length} {type}{items.length !== 1 ? "s" : ""} uploaded</p>
          </div>
          {items.map((item) => (
            <Card
              key={item.id}
              className="group border shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-0">
                <div className="flex items-center gap-4 px-4 py-3">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    type === "video" ? "bg-rose-50" : type === "pdf" ? "bg-red-50" : "bg-blue-50"
                  )}>
                    <TypeIcon size={18} className={
                      type === "video" ? "text-rose-500" : type === "pdf" ? "text-red-500" : "text-blue-500"
                    } />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {item.description && (
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      )}
                      <span className="text-xs text-muted-foreground/60 shrink-0">
                        {format(new Date(item.created_at), "dd MMM yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-semibold uppercase tracking-wide shrink-0 hidden sm:inline-flex">
                    {item.type}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all duration-200"
                    onClick={async () => {
                      try {
                        await deleteMaterial.mutateAsync(item.id);
                        toast.success("File removed");
                      } catch {
                        toast.error("Failed to remove file");
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Quiz Tab ────────────────────────────────────────────────────────────────
function QuizTab() {
  const { data, isLoading } = useAdminQuizzes();
  const [builderOpen, setBuilderOpen] = useState(false);
  const [assignQuiz, setAssignQuiz] = useState<{ id: number; title: string } | null>(null);
  const [resultsQuiz, setResultsQuiz] = useState<{ id: number; title: string } | null>(null);

  const quizzes = data?.data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} created
          </p>
        </div>
        <Button size="sm" onClick={() => setBuilderOpen(true)} className="gap-1.5 shadow-sm">
          <Plus size={14} /> Create Quiz
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="rounded-2xl border bg-card shadow-sm py-16 text-center">
          <ClipboardCheck size={40} className="mx-auto mb-3 text-muted-foreground/20" strokeWidth={1.5} />
          <p className="font-medium text-foreground">No quizzes created yet</p>
          <p className="text-sm text-muted-foreground mt-1">Create your first quiz to start assessing trainees.</p>
          <Button
            size="sm"
            className="mt-4 gap-1.5"
            onClick={() => setBuilderOpen(true)}
          >
            <Plus size={14} /> Create Your First Quiz
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="border shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center gap-5 px-5 py-4">
                  {/* Quiz icon */}
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[oklch(0.56_0.22_270)]/10 to-[oklch(0.56_0.22_270)]/5 flex items-center justify-center shrink-0">
                    <ClipboardCheck size={18} className="text-[oklch(0.44_0.20_270)]" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{quiz.title}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{quiz.questions_count}</span> questions
                      </span>
                      <span className="text-border">|</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <span className="font-semibold text-foreground">{quiz.assignments_count}</span> assigned
                      </span>
                      <span className="text-border">|</span>
                      {quiz.pass_rate !== null ? (
                        <span className="inline-flex items-center gap-1 text-xs">
                          <span className={cn(
                            "font-semibold",
                            quiz.pass_rate >= 70 ? "text-green-600" : "text-red-600"
                          )}>
                            {quiz.pass_rate}%
                          </span>
                          <span className="text-muted-foreground">pass rate</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/60">No attempts yet</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 h-8"
                      onClick={() => setAssignQuiz({ id: quiz.id, title: quiz.title })}
                    >
                      <Users size={13} /> Assign
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1.5 h-8"
                      onClick={() => setResultsQuiz({ id: quiz.id, title: quiz.title })}
                    >
                      <Eye size={13} /> Results
                    </Button>
                  </div>
                </div>

                {/* Pass rate progress bar */}
                {quiz.pass_rate !== null && (
                  <div className="h-1 bg-muted/40">
                    <div
                      className={cn(
                        "h-full transition-all duration-500",
                        quiz.pass_rate >= 70 ? "bg-green-500" : "bg-red-400"
                      )}
                      style={{ width: `${quiz.pass_rate}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Results panel */}
      {resultsQuiz && (
        <Card className="border shadow-sm overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Quiz Results</h3>
              <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setResultsQuiz(null)}>
                Close
              </Button>
            </div>
            <QuizResultsPanel quizId={resultsQuiz.id} quizTitle={resultsQuiz.title} />
          </CardContent>
        </Card>
      )}

      <QuizBuilderModal open={builderOpen} onClose={() => setBuilderOpen(false)} />
      {assignQuiz && (
        <AssignQuizModal
          open={!!assignQuiz}
          onClose={() => setAssignQuiz(null)}
          quizId={assignQuiz.id}
          quizTitle={assignQuiz.title}
        />
      )}
    </div>
  );
}

// ── Tab config ──────────────────────────────────────────────────────────────
const TABS = [
  { value: "company-info", label: "Company Info", icon: Building2 },
  { value: "materials", label: "PDFs & Docs", icon: FileText },
  { value: "videos", label: "Videos", icon: Video },
  { value: "quizzes", label: "Quizzes", icon: ClipboardCheck },
] as const;

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminTrainingPage() {
  return (
    <div className="max-w-6xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Training Management</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage learning content, upload materials, and create quizzes for your team
        </p>
      </div>

      {/* Overview stats */}
      <OverviewStats />

      {/* Tabs */}
      <Tabs defaultValue="company-info">
        <TabsList className="bg-muted/40 border border-border/50 p-1 h-auto gap-0.5">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="gap-2 text-xs font-semibold data-[state=active]:bg-card data-[state=active]:shadow-sm px-4 py-2"
            >
              <Icon size={14} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="company-info" className="mt-6">
          <CompanyInfoTab />
        </TabsContent>

        <TabsContent value="materials" className="mt-6">
          <MaterialsTab type="pdf" />
        </TabsContent>

        <TabsContent value="videos" className="mt-6">
          <MaterialsTab type="video" />
        </TabsContent>

        <TabsContent value="quizzes" className="mt-6">
          <QuizTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
