"use client";

import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Pencil, KeyRound, ToggleLeft, ToggleRight, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  useUsers,
  useToggleUserActive,
  useResetPassword,
  type UserData,
} from "@/hooks/useUsers";
import CreateUserModal from "@/components/users/CreateUserModal";
import EditUserModal from "@/components/users/EditUserModal";
import ResetPasswordDialog from "@/components/users/ResetPasswordDialog";

const ROLE_TABS = ["all", "executive", "trainee"] as const;

const roleBadge = (role: string) =>
  role === "executive" ? (
    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-xs font-semibold">
      Executive
    </Badge>
  ) : (
    <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 text-xs font-semibold">
      Trainee
    </Badge>
  );

const statusBadge = (active: boolean) =>
  active ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs font-semibold">
      Active
    </Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-xs font-semibold">
      Inactive
    </Badge>
  );

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleTab, setRoleTab] = useState<(typeof ROLE_TABS)[number]>("all");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [toggleTarget, setToggleTarget] = useState<UserData | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  // 300 ms debounce on search — also reset page
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const filters = {
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(roleTab !== "all" && { role: roleTab }),
    page,
    per_page: 20,
  };

  const { data, isLoading } = useUsers(filters);
  const pagination = data?.meta?.pagination;
  const toggleActive = useToggleUserActive();
  const resetPassword = useResetPassword();

  const handleToggleConfirm = useCallback(async () => {
    if (!toggleTarget) return;
    await toggleActive.mutateAsync(toggleTarget.id);
    setToggleTarget(null);
  }, [toggleTarget, toggleActive]);

  const handleResetPassword = useCallback(
    async (user: UserData) => {
      const res = await resetPassword.mutateAsync(user.id);
      setTempPassword(res.temporary_password);
    },
    [resetPassword]
  );

  const users: UserData[] = data?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team Members</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your team&apos;s access and roles</p>
        </div>
        <Button
          onClick={() => setCreateOpen(true)}
          className="gap-2 shadow-sm"
        >
          <UserPlus size={15} />
          Add User
        </Button>
      </div>

      {/* Search + role tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-64 h-9 bg-card"
        />
        <div className="flex gap-0.5 p-1 bg-muted/50 rounded-lg border border-border/60">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => { setRoleTab(tab); setPage(1); }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-200 ${
                roleTab === tab
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "all" ? "All" : tab + "s"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                Name
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                Phone
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                Role
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10">
                Last Login
              </TableHead>
              <TableHead className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground h-10 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border">
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j} className="py-3">
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}

            {!isLoading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Users
                      size={40}
                      className="text-muted-foreground opacity-20"
                      strokeWidth={1.5}
                    />
                    <p className="text-sm font-medium text-foreground">No users found</p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search or filter.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading &&
              users.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors duration-150"
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 ring-2 ring-border">
                        <AvatarFallback className="text-xs font-bold bg-[oklch(0.62_0.19_218)] text-white">
                          {initials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm leading-tight">{user.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {user.phone ?? "—"}
                  </TableCell>
                  <TableCell className="py-3">{roleBadge(user.role)}</TableCell>
                  <TableCell className="py-3">{statusBadge(user.is_active)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground py-3">
                    {user.last_login_at
                      ? format(new Date(user.last_login_at), "dd MMM yyyy, HH:mm")
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <div className="flex justify-end gap-0.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Edit"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        onClick={() => setEditUser(user)}
                      >
                        <Pencil size={13} />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title={user.is_active ? "Deactivate" : "Activate"}
                        className="h-7 w-7 hover:bg-muted/60"
                        onClick={() => setToggleTarget(user)}
                      >
                        {user.is_active ? (
                          <ToggleRight size={15} className="text-green-600" />
                        ) : (
                          <ToggleLeft size={15} className="text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        title="Reset Password"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                        onClick={() => handleResetPassword(user)}
                      >
                        <KeyRound size={13} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {pagination.last_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= pagination.last_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
      <EditUserModal user={editUser} onClose={() => setEditUser(null)} />
      <ResetPasswordDialog password={tempPassword} onClose={() => setTempPassword(null)} />

      {/* Toggle active confirmation */}
      <AlertDialog open={!!toggleTarget} onOpenChange={(o) => !o && setToggleTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.is_active ? "Deactivate" : "Activate"} User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.is_active
                ? `${toggleTarget.name} will no longer be able to log in.`
                : `${toggleTarget?.name} will regain access to the platform.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleConfirm}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
