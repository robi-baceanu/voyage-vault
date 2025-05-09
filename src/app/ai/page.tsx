import NavBar from "@/components/NavBar";
import AIChatClient from "@/components/AIChatClient";

export default function AIPage() {
  return (
    <>
      <NavBar />
      <main className="pt-20 p-4 bg-white dark:bg-gray-900 min-h-screen">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          AI Companion
        </h1>
        <AIChatClient />
      </main>
    </>
  );
}
