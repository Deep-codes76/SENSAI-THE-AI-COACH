"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, PlusCircle, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/app/lib/schema";
import { formatDisplayDate } from "@/app/lib/helper";
import { improveWithAI } from "@/actions/resume";
import useFetch from "@/hooks/use-fetch";

const emptyEntry = {
  title: "",
  organization: "",
  startDate: "",
  endDate: "",
  description: "",
  current: false,
};

export function EntryForm({ type, entries = [], onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  // null = adding a new entry, number = editing that index.
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: emptyEntry,
  });

  const current = watch("current");
  const description = watch("description");

  /*
   * Entries are stored exactly as the `<input type="month">` value (yyyy-MM)
   * and only formatted for display. The original code stored the formatted
   * string ("Jan 2024") back into form state, so reopening an entry showed an
   * empty, invalid date field.
   */
  const submitEntry = handleValidation((data) => {
    const entry = { ...data, endDate: data.current ? "" : data.endDate };

    if (editingIndex === null) {
      onChange([...entries, entry]);
    } else {
      onChange(entries.map((e, i) => (i === editingIndex ? entry : e)));
    }

    reset(emptyEntry);
    setEditingIndex(null);
    setIsOpen(false);
  });

  const startEdit = (index) => {
    reset({ ...emptyEntry, ...entries[index] });
    setEditingIndex(index);
    setIsOpen(true);
  };

  const cancel = () => {
    reset(emptyEntry);
    setEditingIndex(null);
    setIsOpen(false);
  };

  const handleDelete = (index) => {
    onChange(entries.filter((_, i) => i !== index));
    if (editingIndex === index) cancel();
  };

  const { loading: isImproving, fn: improveWithAIFn } = useFetch(improveWithAI);

  const handleImproveDescription = async () => {
    if (!description?.trim()) {
      toast.error("Write a description first, then let the AI sharpen it.");
      return;
    }

    const improved = await improveWithAIFn({
      current: description,
      type: type.toLowerCase(),
    });

    if (improved) {
      setValue("description", improved, { shouldValidate: true });
      toast.success("Description improved.");
    }
  };

  return (
    <div className="space-y-4">
      {entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((item, index) => (
            <Card key={`${item.title}-${index}`} className="bg-muted/30">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="min-w-0">
                  <CardTitle className="truncate text-base">
                    {item.title}
                    {item.organization ? ` @ ${item.organization}` : ""}
                  </CardTitle>
                  <p className="numeric mt-1 text-xs text-muted-foreground">
                    {formatDisplayDate(item.startDate)} —{" "}
                    {item.current ? "Present" : formatDisplayDate(item.endDate)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={`Edit ${item.title}`}
                    onClick={() => startEdit(index)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={`Remove ${item.title}`}
                    onClick={() => handleDelete(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                  {item.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isOpen && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="text-base">
              {editingIndex === null ? `Add ${type}` : `Edit ${type}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${type}-title`}>Title / position</Label>
                <Input id={`${type}-title`} {...register("title")} />
                {errors.title && (
                  <p className="text-sm text-destructive">
                    {errors.title.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${type}-org`}>Organization</Label>
                <Input id={`${type}-org`} {...register("organization")} />
                {errors.organization && (
                  <p className="text-sm text-destructive">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`${type}-start`}>Start date</Label>
                <Input
                  id={`${type}-start`}
                  type="month"
                  {...register("startDate")}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive">
                    {errors.startDate.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`${type}-end`}>End date</Label>
                <Input
                  id={`${type}-end`}
                  type="month"
                  disabled={current}
                  {...register("endDate")}
                />
                {errors.endDate && (
                  <p className="text-sm text-destructive">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`${type}-current`}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) setValue("endDate", "");
                }}
              />
              <Label htmlFor={`${type}-current`} className="font-normal">
                I am currently here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`${type}-desc`}>Description</Label>
              <Textarea
                id={`${type}-desc`}
                className="h-32"
                placeholder={`What did you do, and what changed because of it?`}
                {...register("description")}
              />
              {errors.description && (
                <p className="text-sm text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !description?.trim()}
            >
              {isImproving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Improving…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button type="button" variant="outline" onClick={cancel}>
              Cancel
            </Button>
            <Button type="button" onClick={submitEntry}>
              {editingIndex === null ? "Add entry" : "Save changes"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isOpen && (
        <Button
          type="button"
          className="w-full"
          variant="outline"
          onClick={() => {
            reset(emptyEntry);
            setEditingIndex(null);
            setIsOpen(true);
          }}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add {type}
        </Button>
      )}
    </div>
  );
}

export default EntryForm;
