import ChatbotWidget from "@/lib/components/ChatbotWidget";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <ChatbotWidget />
    </>
  );
}
