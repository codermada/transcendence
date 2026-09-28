import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statements = {
  ...defaultStatements,
  content: ["create", "read", "update", "delete", "moderate"],
} as const;

const ac = createAccessControl(statements);

export const roles = {
  user: ac.newRole({ content: ["read", "create"] }),
  moderator: ac.newRole({ content: ["read", "create", "delete"] }),
  admin: ac.newRole({
    ...adminAc.statements,
    content: ["create", "read", "update", "delete", "moderate"],
  }),
};

export { ac };