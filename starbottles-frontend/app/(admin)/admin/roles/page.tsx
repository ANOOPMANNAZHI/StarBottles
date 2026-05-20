"use client";

import { useState } from "react";
import {
  Shield, Plus, Trash2, Loader2, Users, Check, X, Pencil, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useRoles, usePermissions, useCreateRole, useUpdateRole, useDeleteRole,
  type RoleItem,
} from "@/hooks/useRoles";
import { cn } from "@/lib/utils";

export default function RolesPage() {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: permGroups = [], isLoading: permsLoading } = usePermissions();
  const createRole = useCreateRole();
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [editingRole, setEditingRole] = useState<number | null>(null);
  const [editPerms, setEditPerms] = useState<string[]>([]);
  const [editName, setEditName] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPerms, setNewPerms] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<RoleItem | null>(null);

  const allPerms = permGroups.flatMap((g) => g.permissions.map((p) => p.name));

  function startEdit(role: RoleItem) {
    setEditingRole(role.id);
    setEditPerms([...role.permissions]);
    setEditName(role.name);
  }

  function cancelEdit() {
    setEditingRole(null);
    setEditPerms([]);
    setEditName("");
  }

  function saveEdit(role: RoleItem) {
    updateRole.mutate(
      {
        id: role.id,
        ...(role.is_default ? {} : { name: editName }),
        permissions: editPerms,
      },
      { onSuccess: () => cancelEdit() }
    );
  }

  function handleCreate() {
    createRole.mutate(
      { name: newName, permissions: newPerms },
      {
        onSuccess: () => {
          setShowCreate(false);
          setNewName("");
          setNewPerms([]);
        },
      }
    );
  }

  function togglePerm(perms: string[], setPerms: (p: string[]) => void, perm: string) {
    setPerms(
      perms.includes(perm) ? perms.filter((p) => p !== perm) : [...perms, perm]
    );
  }

  const isLoading = rolesLoading || permsLoading;

  return (
    <div className="max-w-5xl mx-auto px-5 lg:px-8 py-6 lg:py-8 space-y-6">
      {/* Header */}
      <div
        className="rounded-xl overflow-hidden relative"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.08 270) 0%, oklch(0.28 0.12 270) 50%, oklch(0.40 0.16 260) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-white/80" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                Roles & Access
              </h1>
              <p className="text-xs text-white/40 mt-0.5">
                Manage roles and what each role can access
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreate(true)}
            className="gap-1.5 font-semibold"
          >
            <Plus size={14} /> New Role
          </Button>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Create new role form */}
      {showCreate && (
        <Card className="border-2 border-primary/30 shadow-md">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Create New Role</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCreate(false);
                  setNewName("");
                  setNewPerms([]);
                }}
              >
                <X size={16} />
              </Button>
            </div>

            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">
                Role Name (lowercase, hyphens only)
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. sales-manager"
                className="max-w-xs"
              />
            </div>

            <PermissionMatrix
              permGroups={permGroups}
              selected={newPerms}
              onChange={(p) => togglePerm(newPerms, setNewPerms, p)}
              disabled={false}
            />

            <div className="flex gap-2">
              <Button
                size="sm"
                disabled={!newName || newPerms.length === 0 || createRole.isPending}
                onClick={handleCreate}
                className="gap-1.5"
              >
                {createRole.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Plus size={14} />
                )}
                Create Role
              </Button>
            </div>

            {createRole.isError && (
              <p className="text-sm text-red-500">
                {(createRole.error as any)?.response?.data?.message || "Failed to create role."}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role cards */}
      {!isLoading &&
        roles.map((role) => {
          const isEditing = editingRole === role.id;
          const isAdmin = role.name === "admin";

          return (
            <Card
              key={role.id}
              className={cn(
                "border shadow-sm transition-all",
                isEditing && "ring-2 ring-primary/30"
              )}
            >
              <CardContent className="p-5 space-y-4">
                {/* Role header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {isEditing && !role.is_default ? (
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="max-w-[200px] h-8 text-sm font-semibold"
                      />
                    ) : (
                      <h3 className="font-semibold text-foreground text-lg">
                        {role.name}
                      </h3>
                    )}
                    {role.is_default && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase tracking-wider"
                      >
                        Default
                      </Badge>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users size={12} />
                      {role.users_count} user{role.users_count !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <div className="flex gap-1.5 shrink-0">
                    {isEditing ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          className="h-8 gap-1"
                        >
                          <X size={13} /> Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(role)}
                          disabled={
                            updateRole.isPending ||
                            (isAdmin ? false : editPerms.length === 0)
                          }
                          className="h-8 gap-1"
                        >
                          {updateRole.isPending ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                          Save
                        </Button>
                      </>
                    ) : (
                      <>
                        {!isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(role)}
                            className="h-8 gap-1"
                          >
                            <Pencil size={13} /> Edit
                          </Button>
                        )}
                        {!role.is_default && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDeleteTarget(role)}
                            className="h-8 gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Permissions */}
                {isAdmin && !isEditing ? (
                  <p className="text-sm text-muted-foreground">
                    Admin has full access to all screens. This cannot be changed.
                  </p>
                ) : (
                  <PermissionMatrix
                    permGroups={permGroups}
                    selected={isEditing ? editPerms : role.permissions}
                    onChange={(p) =>
                      isEditing
                        ? togglePerm(editPerms, setEditPerms, p)
                        : undefined
                    }
                    disabled={!isEditing}
                  />
                )}

                {isEditing && updateRole.isError && (
                  <p className="text-sm text-red-500">
                    {(updateRole.error as any)?.response?.data?.message ||
                      "Failed to update role."}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role "{deleteTarget?.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget && deleteTarget.users_count > 0
                ? `This role has ${deleteTarget.users_count} user(s) assigned. You must reassign them first.`
                : "This action cannot be undone. The role will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                deleteRole.isPending ||
                (deleteTarget?.users_count ?? 0) > 0
              }
              onClick={() => {
                if (deleteTarget) {
                  deleteRole.mutate(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteRole.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ── Permission matrix component ─────────────────────────────────── */

function PermissionMatrix({
  permGroups,
  selected,
  onChange,
  disabled,
}: {
  permGroups: { group: string; permissions: { name: string; label: string }[] }[];
  selected: string[];
  onChange: (perm: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="space-y-3">
      {permGroups.map((group) => (
        <div key={group.group}>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground mb-1.5">
            {group.group}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.permissions.map((perm) => {
              const active = selected.includes(perm.name);
              return (
                <button
                  key={perm.name}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(perm.name)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all duration-150",
                    active
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-muted/40 border-border text-muted-foreground",
                    !disabled && "hover:border-primary/50 cursor-pointer",
                    disabled && "cursor-default"
                  )}
                >
                  {active ? (
                    <Check size={12} className="text-primary" />
                  ) : (
                    <div className="w-3 h-3 rounded border border-muted-foreground/30" />
                  )}
                  {perm.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
