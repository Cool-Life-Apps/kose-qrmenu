import Link from "next/link";
import Image from "next/image";
import { Playfair_Display, Bebas_Neue } from 'next/font/google';
const playfair = Playfair_Display({ subsets: ['latin'], weight: ["400", "500", "600"] });
const bebas = Bebas_Neue({ subsets: ['latin'], weight: ["400"] });

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#2d2323] via-[#3a232b] to-[#18181b] font-[Montserrat]">
      <div className="flex flex-col md:flex-row md:space-x-10 space-y-6 md:space-y-0 items-center w-full max-w-2xl px-4">
        <Link href="/menu/pastane" className="block w-60 h-60 md:w-72 md:h-72 bg-[#5a232b]/95 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center p-3 md:p-6 border-2 border-[#a97b7b]">
          <Image src="/logo_curlique_eatery.png" alt="Curlique Eatery" width={90} height={90} className="mb-3 md:mb-6 object-contain drop-shadow-md rounded-full" />
          <span className="flex flex-col items-center text-white text-center break-words">
            <span className={`${playfair.className} text-lg md:text-2xl font-normal leading-none tracking-wide`}>Curlique Eatery</span>
            <span className="text-sm md:text-base font-normal tracking-wide mt-1">Menü</span>
          </span>
        </Link>
        <Link href="/menu/kuafor" className="block w-60 h-60 md:w-72 md:h-72 bg-[#000000]/95 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 flex flex-col items-center justify-center p-3 md:p-6 border-2 border-[#444]">
          <Image src="/logo_ramazan_karahan_kuafor.png" alt="Ramazan Karahan Kuaför" width={90} height={90} className="mb-3 md:mb-6 object-contain drop-shadow-md rounded-full" />
          <span className="flex flex-col items-center text-white text-center break-words">
            <span className={`${bebas.className} text-xl md:text-3xl font-extrabold leading-none tracking-widest`}>RAMAZAN</span>
            <span className={`${bebas.className} text-lg md:text-2xl font-semibold leading-none tracking-wider`}>KARAHAN</span>
            <span className={`${bebas.className} text-base md:text-xl font-normal leading-none tracking-wide`}>Kuaför</span>
            <span className="text-sm md:text-base font-normal tracking-wide mt-1">Menü</span>
          </span>
        </Link>
      </div>
    </main>
  );
}