"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, MoreHorizontal, ShieldCheck, User, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  Input,
  Label,
  FormError,
  Skeleton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui";
import { PageHeader } from "@/components/shared";
import { orgService } from "@/services";
import { getInitials } from "@/lib/utils";
import { useAuth } from "@/providers";
import { UserRole } from "@/types";
import type { TeamMember } from "@/types";
import type { AxiosError } from "axios";

type ApiDetailError = AxiosError<{ detail?: string }>;

const inviteSchema = z.object({
  email: z.email("Enter a valid email"),
  role: z.enum([UserRole.OrgAdmin, UserRole.Member]),
});
type InviteValues = z.infer<typeof inviteSchema>;

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
};


interface MemberRowProps {
  member: TeamMember;
  currentUserId?: number;
  onRoleChange: (id: number, role: UserRole) => void;
  onStatusChange: (id: number, isActive: boolean) => void;
  isUpdating: boolean;
}

const MemberRow = ({ member, currentUserId, onRoleChange, onStatusChange, isUpdating }: MemberRowProps) => {
  const isSelf = member.id === currentUserId;
  const isActive = member.status === "active";

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

        <span
          className={
            isActive
              ? "text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full"
              : "text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full"
          }
        >
          {isActive ? "Active" : "Inactive"}
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
              {isActive ? (
                <button
                  onClick={() => onStatusChange(member.id, false)}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-50"
                >
                  <UserX className="w-4 h-4" />
                  Deactivate
                </button>
              ) : (
                <button
                  onClick={() => onStatusChange(member.id, true)}
                  disabled={isUpdating}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-foreground hover:bg-accent transition-colors disabled:opacity-50"
                >
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  Activate
                </button>
              )}
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
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const queryClient = useQueryClient();
  const [showInvite, setShowInvite] = useState<boolean>(false);

  useEffect(() => {
    if (role && role !== UserRole.OrgAdmin) router.replace("/all-proposals");
  }, [role, router]);

  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ["team-members"],
    queryFn: () => orgService.getTeamMembers(),
    enabled: role === UserRole.OrgAdmin,
  });
  const members = membersResponse?.data ?? [];

  const {
    register,
    handleSubmit,
    reset: resetInvite,
    setValue,
    control,
    formState: { errors },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: UserRole.Member },
  });

  const selectedRole = useWatch({ control, name: "role" });

  const { mutate: invite, isPending: isInviting } = useMutation({
    mutationFn: (d: InviteValues) => orgService.inviteMember({ email: d.email, role: d.role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      resetInvite();
      setShowInvite(false);
      toast.success("Invitation sent");
    },
    onError: (err: ApiDetailError) => toast.error(err.response?.data?.detail ??"Failed to send invitation"),
  });

  const { mutate: updateRole, isPending: isUpdatingRole } = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      orgService.updateMemberRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Role updated");
    },
    onError: (err: ApiDetailError) => toast.error(err.response?.data?.detail ??"Failed to update role"),
  });

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      orgService.updateMemberStatus(id, isActive),
    onSuccess: (_, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success(isActive ? "Member activated" : "Member deactivated");
    },
    onError: (err: ApiDetailError) => toast.error(err.response?.data?.detail ?? "Failed to update status"),
  });


  if (!mounted || role !== UserRole.OrgAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <PageHeader
        title="Team"
        description="Manage your organisation members and their roles."
        action={
          <Button onClick={() => setShowInvite((v) => !v)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Invite member
          </Button>
        }
      />

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

      {/* Stats */}
      {!isLoading && members.length > 0 && (
        <div className="flex items-center gap-4">
          {[
            { label: "Total", value: members.length },
            { label: "Active", value: members.filter((m) => m.status === "active").length, highlight: true },
            { label: "Inactive", value: members.filter((m) => m.status === "inactive").length },
          ].map(({ label, value, highlight }) => (
            <div key={label} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className={highlight ? "font-semibold text-emerald-600" : "font-semibold text-foreground"}>
                {value}
              </span>
            </div>
          ))}
        </div>
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
                  onStatusChange={(id, isActive) => updateStatus({ id, isActive })}
                  isUpdating={isUpdatingRole || isUpdatingStatus}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

    </div>
  );
};
