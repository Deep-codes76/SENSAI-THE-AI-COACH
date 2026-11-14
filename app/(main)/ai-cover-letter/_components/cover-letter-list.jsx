"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Eye, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCoverLetter } from "@/actions/cover-letter";

export default function CoverLetterList({ coverLetters }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteCoverLetter(id);
      toast.success("Cover letter deleted.");
      router.refresh();
    } catch (error) {
      toast.error(error.message || "Failed to delete the cover letter");
    } finally {
      setDeletingId(null);
    }
  };

  if (!coverLetters?.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
          <FileText className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <div>
            <p className="font-medium">No cover letters yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Paste a job description and Sensai writes the first draft.
            </p>
          </div>
          <Button asChild>
            <Link href="/ai-cover-letter/new">Create your first letter</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {coverLetters.map((letter) => (
        <Card key={letter.id} className="card-hover">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <CardTitle className="truncate text-xl">
                  {letter.jobTitle}{" "}
                  <span className="text-muted-foreground">at</span>{" "}
                  {letter.companyName}
                </CardTitle>
                <CardDescription className="numeric mt-1 text-xs">
                  {format(new Date(letter.createdAt), "d MMM yyyy")}
                </CardDescription>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label={`Open the letter for ${letter.jobTitle}`}
                  onClick={() => router.push(`/ai-cover-letter/${letter.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>

                {/*
                  The trigger now lives inside its own AlertDialog. Previously
                  the view button sat inside the dialog element too, which made
                  the markup confusing and the dialog state ambiguous.
                */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Delete the letter for ${letter.jobTitle}`}
                      disabled={deletingId === letter.id}
                    >
                      {deletingId === letter.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this cover letter?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently deletes your letter for{" "}
                        {letter.jobTitle} at {letter.companyName}. It cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(letter.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {letter.jobDescription}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
