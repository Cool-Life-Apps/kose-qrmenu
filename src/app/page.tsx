import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Welcome to Köşe</h1>
        <div className="space-x-4">
          <Link href="/menu/pastane" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Pastane
          </Link>
          <Link href="/menu/kuafor" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Kuaför
          </Link>
        </div>
      </div>
    </main>
  );
}