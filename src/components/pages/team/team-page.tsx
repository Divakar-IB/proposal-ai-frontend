"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, MoreHorizontal, ShieldCheck, User, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Label,
  FormError,
  Heading,
  Skeleton,
  ConfirmDialog,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { orgService } from "@/services";
import { useAuth } from "@/providers";
import { UserRole } from "@/types";
import type { TeamMember } from "@/types";
import type { ApiError } from "@/lib/axios";

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum([UserRole.OrgAdmin, UserRole.Member]),
});
type InviteValues = z.infer<typeof inviteSchema>;

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

interface MemberRowProps {
  member: TeamMember;
  currentUserId?: number;
  onRoleChange: (id: number, role: UserRole) => void;
  onRemove: (member: TeamMember) => void;
  isUpdating: boolean;
}

const MemberRow = ({ member, currentUserId, onRoleChange, onRemove, isUpdating }: MemberRowProps) => {
  const isSelf = member.id === currentUserId;

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-semibold">{getInitials(member.name)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground leading-none">
            {member.name}
            {isSelf && (
              <span className="ml-1.5 text-xs text-muted-foreground font-normal">(you)</span>
            )}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{member.email}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground hidden sm:block">
          Joined {formatDate(member.created_at)}
        </span>

        <span
          className={
            member.role === UserRole.OrgAdmin
              ? "text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full"
              : "text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
          }
        >
          {member.role === UserRole.OrgAdmin ? "Admin" : "Member"}
        </span>

        {!isSelf && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1 gap-0">
              {member.role === UserRole.Member ? (
                <button
                  onClick={() => onRoleChange(member.id, UserRole.OrgAdmin)}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  Make admin
                </button>
              ) : (
                <button
                  onClick={() => onRoleChange(member.id, UserRole.Member)}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  Make member
                </button>
              )}
              <div className="my-1 border-t border-border" />
              <button
                onClick={() => onRemove(member)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export const TeamPage = () => {
  const router = useRouter();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState<boolean>(false);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (role && role !== UserRole.OrgAdmin) router.replace("/all-proposals");
  }, [role, router]);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => orgService.getTeamMembers(),
    enabled: role === UserRole.OrgAdmin,
  });

  const {
    register,
    handleSubmit,
    reset: resetInvite,
    setValue,
    watch,
    formState: { errors },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: UserRole.Member },
  });

  const selectedRole = watch("role");

  const { mutate: invite, isPending: isInviting } = useMutation({
    mutationFn: (d: InviteValues) => orgService.inviteMember({ email: d.email, role: d.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      resetInvite();
      setShowInvite(false);
      toast.success("Invitation sent");
    },
    onError: (err: ApiError) => toast.error(err.message ?? "Failed to send invitation"),
  });

  const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      orgService.updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated");
    },
    onError: (err: ApiError) => toast.error(err.message ?? "Failed to update role"),
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: (id: number) => orgService.removeMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      setRemoveTarget(null);
      toast.success("Member removed");
    },
    onError: (err: ApiError) => toast.error(err.message ?? "Failed to remove member"),
  });

  if (!role || role !== UserRole.OrgAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div className="flex items-start justify-between">
        <div>
          <Heading size="lg">Team</Heading>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your organisation members and their roles.
          </p>
        </div>
        <Button onClick={() => setShowInvite((v) => !v)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite member
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <Card>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground">Invite a new member</p>
            <form
              onSubmit={handleSubmit((d) => invite(d))}
              className="flex flex-col gap-4"
            >
              <div className="flex gap-3 items-start">
                <div className="flex flex-col gap-1.5 flex-1">
                  <Label htmlFor="invite-email">Email address</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="colleague@company.com"
                    {...register("email")}
                  />
                  <FormError message={errors.email?.message} />
                </div>
                <div className="flex flex-col gap-1.5 w-36">
                  <Label>Role</Label>
                  <Select
                    value={selectedRole}
                    onValueChange={(v) => setValue("role", v as UserRole)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.Member}>Member</SelectItem>
                      <SelectItem value={UserRole.OrgAdmin}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowInvite(false); resetInvite(); }}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isInviting}>
                  Send invite
                </Button>
              </div>
            </form>
          </div>
        </Card>
      )}

      {/* Members list */}
      <Card>
        <div className="p-2">
          {isLoading ? (
            <div className="flex flex-col gap-2 p-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 py-3 px-2">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <Skeleton className="h-3.5 w-32" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : members.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No members yet. Invite your team to get started.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border/50">
              {members.map((member) => (
                <MemberRow
                  key={member.id}
                  member={member}
                  onRoleChange={(id, role) => updateRole({ id, role })}
                  onRemove={setRemoveTarget}
                  isUpdating={isUpdatingRole}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => { if (!open) setRemoveTarget(null); }}
        title={`Remove ${removeTarget?.name}?`}
        description="They will lose access to the workspace immediately. This action cannot be undone."
        confirmLabel="Remove"
        variant="danger"
        isPending={isRemoving}
        onConfirm={() => removeTarget && removeMember(removeTarget.id)}
      />
    </div>
  );
};
