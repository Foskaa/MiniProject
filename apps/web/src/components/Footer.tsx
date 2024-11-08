'use client'
import { CiFacebook, CiTwitter, CiInstagram, CiLinkedin } from 'react-icons/ci';
import Image from 'next/image';
import Logo from '../../public/Logo.webp'
import { usePathname } from 'next/navigation';

export const Footer = () => {
  const pathname = usePathname()
  return (
    <footer className={`${pathname.startsWith('/event/dashboard') ? "hidden" : "block"} w-full h-72 justify-center items-center flex bg-blue-950 bottom-0 mt-10 border-t-8 border-yellow-500`}>
      <section className="gap-5 flex flex-col text-white justify-center items-center">
        <div className="flex items-center gap-3">
          <Image
            width={500}
            height={500}
            alt="Logo"
            className="w-36"
            src={Logo}
          />
        </div>
        <div className="flex items-center text-lg md:text-2xl gap-1">
          <CiFacebook />
          <CiTwitter />
          <CiInstagram />
          <CiLinkedin />
        </div>

        {/* Logo Sosmed */}
        <div className="w-full grid grid-cols-2 gap-5 text-neutral-500 md:grid-cols-3 md:text-center md:text-base text-xs">
          <h1>Tentang kami?</h1>
          <h1>Syarat dan Ketentuan</h1>
          <h1>Kebijakan Privasi</h1>
        </div>
        <h1 className="text-xs">&copy;2024. PT Celap Celup. All Right Reserved.</h1>
      </section>
    </footer>
  );
};