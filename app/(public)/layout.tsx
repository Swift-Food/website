import FloatingChatbotMount from "@/lib/components/FloatingChatbotMount";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FloatingChatbotMount />
    </>
  );
}
