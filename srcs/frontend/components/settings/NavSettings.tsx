import NavSettings from "@/components/settings/NavSettings";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavSettings />
      <div className="pl-64 pt-16">{children}</div>
    </>
  );
}