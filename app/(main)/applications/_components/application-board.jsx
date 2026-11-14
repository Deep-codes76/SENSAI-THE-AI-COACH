"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import {
  Briefcase,
  ExternalLink,
  LayoutGrid,
  List,
  Loader2,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  deleteApplication,
  updateApplicationStatus,
} from "@/actions/applications";

import ApplicationForm from "./application-form";
import { STATUS_META, STATUS_ORDER, statusMeta } from "./application-constants";

function StatusPicker({ value, onChange, disabled }) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger className="h-8 w-[132px] text-xs" aria-label="Status">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_ORDER.map((key) => (
          <SelectItem key={key} value={key} className="text-xs">
            <span className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_META[key].dot}`} />
              {STATUS_META[key].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ApplicationCard({ application, onEdit, onDelete, onStatusChange, busy }) {
  const meta = statusMeta(application.status);

  return (
    <Card className={`card-hover border ${meta.ring}`}>
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-medium leading-tight">{application.role}</p>
            <p className="truncate text-sm text-muted-foreground">
              {application.company}
              {application.location ? ` · ${application.location}` : ""}
            </p>
          </div>
          {application.url && (
            <a
              href={application.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground transition-colors hover:text-primary"
              aria-label={`Open the posting for ${application.role} at ${application.company}`}
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>

        {application.salary && (
          <p className="numeric text-xs text-muted-foreground">{application.salary}</p>
        )}

        {application.notes && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {application.notes}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 pt-1">
          <StatusPicker
            value={application.status}
            onChange={(status) => onStatusChange(application.id, status)}
            disabled={busy}
          />
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Edit ${application.role}`}
              onClick={() => onEdit(application)}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={`Delete ${application.role}`}
              onClick={() => onDelete(application)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <p className="text-[0.7rem] text-muted-foreground">
          {application.appliedAt
            ? `Applied ${formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}`
            : `Saved ${formatDistanceToNow(new Date(application.createdAt), { addSuffix: true })}`}
        </p>
      </CardContent>
    </Card>
  );
}

export default function ApplicationBoard({ applications }) {
  const router = useRouter();
  const [view, setView] = useState("board");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [, startTransition] = useTransition();

  const grouped = useMemo(() => {
    const byStatus = Object.fromEntries(STATUS_ORDER.map((s) => [s, []]));
    for (const app of applications) {
      (byStatus[app.status] ?? byStatus.saved).push(app);
    }
    return byStatus;
  }, [applications]);

  const handleStatusChange = async (id, status) => {
    setBusyId(id);
    try {
      await updateApplicationStatus(id, status);
      toast.success(`Moved to ${STATUS_META[status].label}.`);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error.message || "Could not update the status");
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    const target = pendingDelete;
    if (!target) return;
    setPendingDelete(null);
    setBusyId(target.id);
    try {
      await deleteApplication(target.id);
      toast.success("Application removed.");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error.message || "Could not delete the application");
    } finally {
      setBusyId(null);
    }
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (application) => {
    setEditing(application);
    setFormOpen(true);
  };

  if (!applications.length) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <Briefcase className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
            <div>
              <p className="font-medium">No applications tracked yet</p>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Add the roles you are chasing and Sensai keeps the pipeline, the
                dates and your notes in one place.
              </p>
            </div>
            <Button onClick={openNew}>
              <Plus className="mr-2 h-4 w-4" />
              Track your first application
            </Button>
          </CardContent>
        </Card>
        <ApplicationForm
          open={formOpen}
          onOpenChange={setFormOpen}
          application={editing}
          onSaved={() => startTransition(() => router.refresh())}
        />
      </>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-border p-0.5">
          <Button
            variant={view === "board" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setView("board")}
          >
            <LayoutGrid className="mr-2 h-3.5 w-3.5" />
            Board
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8"
            onClick={() => setView("list")}
          >
            <List className="mr-2 h-3.5 w-3.5" />
            List
          </Button>
        </div>

        <Button onClick={openNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add application
        </Button>
      </div>

      {view === "board" ? (
        // Horizontally scrollable columns rather than a drag-and-drop board:
        // a Select is keyboard accessible and works on touch, which a drag
        // target does not.
        <div className="-mx-5 overflow-x-auto px-5 pb-2">
          <div className="grid min-w-[980px] grid-cols-5 gap-4">
            {STATUS_ORDER.map((status) => {
              const meta = STATUS_META[status];
              const items = grouped[status];
              return (
                <section key={status} className="space-y-3">
                  <header className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${meta.dot}`} />
                    <h2 className="text-sm font-medium">{meta.label}</h2>
                    <span className="numeric ml-auto text-xs text-muted-foreground">
                      {items.length}
                    </span>
                  </header>
                  <div className="space-y-3">
                    {items.length === 0 ? (
                      <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">
                        {meta.hint}
                      </p>
                    ) : (
                      items.map((application) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          busy={busyId === application.id}
                          onEdit={openEdit}
                          onDelete={setPendingDelete}
                          onStatusChange={handleStatusChange}
                        />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              busy={busyId === application.id}
              onEdit={openEdit}
              onDelete={setPendingDelete}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <ApplicationForm
        open={formOpen}
        onOpenChange={setFormOpen}
        application={editing}
        onSaved={() => startTransition(() => router.refresh())}
      />

      <AlertDialog
        open={Boolean(pendingDelete)}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this application?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete
                ? `${pendingDelete.role} at ${pendingDelete.company} will be deleted permanently.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {busyId ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
