"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import useFetch from "@/hooks/use-fetch";
import { onboardingSchema } from "@/app/lib/schema";
import { updateUser } from "@/actions/user";

const FieldError = ({ error }) =>
  error ? (
    <p role="alert" className="text-sm text-destructive">
      {error.message}
    </p>
  ) : null;

export default function OnboardingForm({ industries }) {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  const { loading: updateLoading, fn: updateUserFn } = useFetch(updateUser);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { industry: "", subIndustry: "", bio: "", skills: "" },
  });

  /*
   * The original flow awaited the action, then waited for an effect to see
   * `updateResult?.success`. The action returned the transaction object (which
   * had no `success` key and was in fact undefined), so the toast and the
   * redirect never fired and onboarding appeared to hang forever.
   *
   * The result is now acted on directly at the call site.
   */
  const onSubmit = async (values) => {
    const formattedIndustry = `${values.industry}-${values.subIndustry
      .toLowerCase()
      .replace(/\s+/g, "-")}`;

    const result = await updateUserFn({
      ...values,
      industry: formattedIndustry,
    });

    if (result?.success) {
      toast.success("Profile complete — generating your industry insights.");
      router.push("/dashboard");
      router.refresh();
    }
  };

  const watchIndustry = watch("industry");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <p className="section-label">Step 1 of 1</p>
        <h1 className="mt-3 text-4xl md:text-5xl">Complete your profile</h1>
        <p className="mt-3 text-muted-foreground">
          This is the only setup Sensai needs. Every tool reads from it.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your professional profile</CardTitle>
          <CardDescription>
            Used to tailor insights, resume feedback and interview questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select
                onValueChange={(value) => {
                  setValue("industry", value, { shouldValidate: true });
                  setSelectedIndustry(industries.find((i) => i.id === value));
                  setValue("subIndustry", "");
                }}
              >
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select an industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Industries</SelectLabel>
                    {industries.map((ind) => (
                      <SelectItem key={ind.id} value={ind.id}>
                        {ind.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldError error={errors.industry} />
            </div>

            {watchIndustry && (
              <div className="space-y-2 animate-fade-up">
                <Label htmlFor="subIndustry">Specialization</Label>
                <Select
                  value={watch("subIndustry") || undefined}
                  onValueChange={(value) =>
                    setValue("subIndustry", value, { shouldValidate: true })
                  }
                >
                  <SelectTrigger id="subIndustry">
                    <SelectValue placeholder="Select your specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Specializations</SelectLabel>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError error={errors.subIndustry} />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="experience">Years of experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                placeholder="4"
                {...register("experience")}
              />
              <FieldError error={errors.experience} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                placeholder="React, TypeScript, PostgreSQL"
                {...register("skills")}
              />
              <p className="text-sm text-muted-foreground">
                Separate multiple skills with commas.
              </p>
              <FieldError error={errors.skills} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Professional bio</Label>
              <Textarea
                id="bio"
                placeholder="What do you build, and what are you aiming for next?"
                className="h-28"
                {...register("bio")}
              />
              <FieldError error={errors.bio} />
            </div>

            <Button type="submit" className="w-full" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating your industry profile…
                </>
              ) : (
                "Complete profile"
              )}
            </Button>

            {updateLoading && (
              <p className="text-center text-xs text-muted-foreground">
                First-time setup for a new industry calls the model, so this can
                take a few seconds.
              </p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
