"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApplication, updateApplication } from "@/actions/applications";
import useFetch from "@/hooks/use-fetch";

import { STATUS_META, STATUS_ORDER } from "./application-constants";

const blank = {
  company: "",
  role: "",
  location: "",
  url: "",
  source: "",
  salary: "",
  status: "saved",
  notes: "",
};

export default function ApplicationForm({ open, onOpenChange, application, onSaved }) {
  const isEdit = Boolean(application);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: blank });

  useEffect(() => {
    if (!open) return;
    reset(
      application
        ? {
            company: application.company ?? "",
            role: application.role ?? "",
            location: application.location ?? "",
            url: application.url ?? "",
            source: application.source ?? "",
            salary: application.salary ?? "",
            status: application.status ?? "saved",
            notes: application.notes ?? "",
          }
        : blank
    );
  }, [open, application, reset]);

  const { loading: saving, fn: saveFn } = useFetch(
    isEdit ? (values) => updateApplication(application.id, values) : createApplication
  );

  const onSubmit = async (values) => {
    const result = await saveFn(values);
    if (result?.success) {
      toast.success(isEdit ? "Application updated." : "Application added.");
      onOpenChange(false);
      onSaved?.();
    }
  };

  const status = watch("status");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit application" : "Track an application"}
          </DialogTitle>
          <DialogDescription>
            Only the company and role are required — fill in the rest as you go.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="Northwind Labs"
                {...register("company", { required: "Company is required" })}
              />
              {errors.company && (
                <p className="text-sm text-destructive">{errors.company.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                placeholder="Senior Frontend Engineer"
                {...register("role", { required: "Role is required" })}
              />
              {errors.role && (
                <p className="text-sm text-destructive">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="Remote" {...register("location")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary</Label>
              <Input id="salary" placeholder="₹30–40 LPA" {...register("salary")} />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input id="source" placeholder="LinkedIn, referral…" {...register("source")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setValue("status", value)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ORDER.map((key) => (
                    <SelectItem key={key} value={key}>
                      {STATUS_META[key].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Posting URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://…"
              {...register("url")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              className="h-24"
              placeholder="Who you spoke to, what to prepare, next steps…"
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving…
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add application"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
