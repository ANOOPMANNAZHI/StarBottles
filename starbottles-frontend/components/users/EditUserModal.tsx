"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useUpdateUser, type UserData } from "@/hooks/useUsers";

const schema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  phone: z.string().min(1, "Phone is required").max(20),
  role: z.enum(["executive", "trainee"]),
});

type FormValues = z.infer<typeof schema>;

interface EditUserModalProps {
  user: UserData | null;
  onClose: () => void;
}

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name,
        phone: user.phone ?? "",
        role: (user.role as "executive" | "trainee") ?? "executive",
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    await updateUser.mutateAsync({ id: user.id, ...data });
    onClose();
  };

  return (
    <Dialog open={!!user} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Full Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Phone</Label>
            <Input {...register("phone")} />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Role</Label>
            <Select
              defaultValue={user?.role}
              onValueChange={(v) => setValue("role", v as "executive" | "trainee")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="trainee">Trainee</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-xs text-red-500">{errors.role.message}</p>}
          </div>

          {updateUser.error && (
            <p className="text-sm text-red-600">Failed to update user. Please try again.</p>
          )}

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || updateUser.isPending}>
              {(isSubmitting || updateUser.isPending) && (
                <Loader2 size={14} className="mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
