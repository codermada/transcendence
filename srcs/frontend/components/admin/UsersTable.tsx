"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import { ChevronLeft, ChevronRight } from "@/components/icons";

type User = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

type UsersTableProps = {
  users: User[];
  onUserUpdated: (updatedUser: User) => void;
};

const USERS_PER_PAGE = 10;

export default function UsersTable({
  users,
  onUserUpdated,
}: UsersTableProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(
    null,
  );

  const [currentPage, setCurrentPage] = useState(1);

  const { data: session } = authClient.useSession();

  const currentUserId = session?.user?.id;

  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  const startIndex = (currentPage - 1) * USERS_PER_PAGE;

  const currentUsers = users.slice(
    startIndex,
    startIndex + USERS_PER_PAGE,
  );

  const handleRoleChange = async (user: User) => {
    // Prevent changing your own role
    if (user.id === currentUserId) {
      return;
    }

    const newRole = user.role === "admin" ? "user" : "admin";

    setUpdatingUserId(user.id);

    const { error } = await authClient.admin.setRole({
      userId: user.id,
      role: newRole,
    });

    setUpdatingUserId(null);

    if (error) {
      console.error("Failed to change user role:", error);
      return;
    }

    onUserUpdated({
      ...user,
      role: newRole,
    });
  };

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    setCurrentPage(page);
  };

  return (
    <div
      className="
        relative overflow-hidden
        rounded-2xl
        border border-border
        bg-surface/40
        shadow-2xl shadow-black/20
        backdrop-blur-xl
      "
    >
      {/* Futuristic top line */}
      <div
        aria-hidden
        className="
          pointer-events-none
          absolute inset-x-10 top-0
          h-px
          bg-gradient-to-r
          from-transparent
          via-brand-500/50
          to-transparent
          shadow-[0_0_14px_rgb(139_92_246_/_0.35)]
        "
      />

      <div className="overflow-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-hover/60">
              <th className="w-12 border-r border-border px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-muted">
                #
              </th>

              <th className="min-w-[220px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                User ID
              </th>

              <th className="min-w-[220px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Name
              </th>

              <th className="min-w-[300px] border-r border-border px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Email
              </th>

              <th className="min-w-[140px] px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-muted">
                Admin
              </th>
            </tr>
          </thead>

          <tbody>
            {currentUsers.map((user, index) => {
              const isCurrentUser = user.id === currentUserId;
              const isAdmin = user.role === "admin";
              const isUpdating = updatingUserId === user.id;

              return (
                <tr
                  key={user.id}
                  className="group border-b border-border transition-colors last:border-b-0 hover:bg-surface-hover/50"
                >
                  <td className="border-r border-border bg-surface-hover/30 px-3 py-2.5 text-center text-xs text-muted">
                    {startIndex + index + 1}
                  </td>

                  <td className="border-r border-border px-4 py-2.5 font-mono text-xs text-muted">
                    {user.id}
                  </td>

                  <td className="border-r border-border px-4 py-2.5 text-foreground">
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>

                      {isCurrentUser && (
                        <span
                          className="
                            rounded-full
                            border border-brand-500/30
                            bg-brand-500/10
                            px-2 py-0.5
                            text-[10px] font-medium
                            text-brand-400
                          "
                        >
                          You
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="border-r border-border px-4 py-2.5 text-subtle">
                    {user.email}
                  </td>

                  <td className="px-4 py-2.5">
                    <div className="flex items-center">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={isAdmin}
                        disabled={isCurrentUser || isUpdating}
                        onClick={() => handleRoleChange(user)}
                        className={`
                          relative inline-flex h-6 w-11 items-center
                          rounded-full
                          transition-colors
                          focus:outline-none
                          focus:ring-2 focus:ring-brand-500/20
                          disabled:cursor-not-allowed
                          disabled:opacity-40
                          ${
                            isAdmin
                              ? "bg-brand-600 shadow-[0_0_12px_rgb(139_92_246_/_0.4)]"
                              : "bg-border"
                          }
                        `}
                      >
                        <span
                          className={`
                            inline-block h-4 w-4 rounded-full
                            bg-white
                            transition-transform
                            ${
                              isAdmin
                                ? "translate-x-6"
                                : "translate-x-1"
                            }
                          `}
                        />
                      </button>

                      <span
                        className={`ml-2 text-xs ${
                          isAdmin ? "text-brand-400" : "text-muted"
                        }`}
                      >
                        {isAdmin ? "Admin" : "User"}
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {currentUsers.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-sm text-muted"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted">
            Showing{" "}
            <span className="font-medium text-foreground">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-foreground">
              {Math.min(
                startIndex + USERS_PER_PAGE,
                users.length,
              )}
            </span>{" "}
            of{" "}
            <span className="font-medium text-foreground">
              {users.length}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="
                flex items-center gap-1
                rounded-lg
                border border-border
                px-3 py-1.5
                text-xs text-subtle
                transition-colors
                hover:border-border-hover
                hover:text-foreground
                focus:outline-none
                focus:ring-2 focus:ring-brand-500/20
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            {Array.from(
              { length: totalPages },
              (_, index) => index + 1,
            ).map((page) => {
              const isActive = currentPage === page;

              return (
                <button
                  key={page}
                  type="button"
                  onClick={() => goToPage(page)}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    min-w-8 rounded-lg px-2 py-1.5 text-xs font-medium
                    transition-colors
                    focus:outline-none
                    focus:ring-2 focus:ring-brand-500/20
                    ${
                      isActive
                        ? "bg-brand-600 text-white shadow-[0_0_12px_rgb(139_92_246_/_0.4)]"
                        : "text-muted hover:bg-surface-hover hover:text-foreground"
                    }
                  `}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="
                flex items-center gap-1
                rounded-lg
                border border-border
                px-3 py-1.5
                text-xs text-subtle
                transition-colors
                hover:border-border-hover
                hover:text-foreground
                focus:outline-none
                focus:ring-2 focus:ring-brand-500/20
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}