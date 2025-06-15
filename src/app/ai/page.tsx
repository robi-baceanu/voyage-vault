import NavBar from "@/components/NavBar";
import AIChatClient from "@/components/AIChatClient";

export default function AIPage() {
  return (
    <>
      <NavBar />
      <main className="pt-20 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <AIChatClient />
      </main>
    </>
  );
}
