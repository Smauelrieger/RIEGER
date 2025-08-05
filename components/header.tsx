"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Phone } from "lucide-react"

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const handleNavLinkClick = () => {
    setIsSheetOpen(false)
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="bg-gray-900 text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/riegerimoveis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33V22H12c5.523 0 10-4.477 10-10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/riegerimoveis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M12 2C8.683 2 7.915 2.027 7.006 2.06C6.097 2.093 5.413 2.24 4.78 2.515c-.63.275-1.17.66-1.69 1.18-.52.52-.905 1.06-1.18 1.69-.275.63-.422 1.313-.455 2.222C2.027 7.915 2 8.683 2 12s.027 4.085.06 4.994c.033.909.18 1.593.455 2.222.275.63.66 1.17 1.18 1.69.52.52 1.06 1.06 1.69 1.18.63.275 1.313.422 2.222.455C7.915 21.973 8.683 22 12 22s4.085-.027 4.994-.06c.909-.033 1.593-.18 2.222-.455.63-.275 1.17-.66 1.69-1.18.52-.52.905-1.06 1.18-1.69.275-.63.422-1.313.455-2.222.033-.909.06-1.593.06-4.994s-.027-4.085-.06-4.994c-.033-.909-.18-1.593-.455-2.222-.275-.63-.66-1.17-1.18-1.69-.52-.52-.905-1.06-1.18-1.69-.275-.63-.422-1.313-.455-2.222C21.973 7.915 22 7.317 22 12zM12 7a5 5 0 100 10 5 5 0 000-10zm0 8a3 3 0 110-6 3 3 0 010 6zm6.5-.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://twitter.com/riegerimoveis"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.007-.532A8.318 8.318 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 012 10.447v.05c0 4.556 3.26 8.384 7.594 9.273a4.072 4.072 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.844" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@riegerimoveis1225?si=dlw1DnAEo6Od9pSg"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-yellow-400"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M19.812 5.44c-.31-.11-.63-.17-1.002-.17-.48 0-.96.06-1.44.17-1.2.28-2.4.42-3.6.42s-2.4-.14-3.6-.42c-.48-.11-.96-.17-1.44-.17-.372 0-.692.06-1.002.17C3.89 5.61 2 7.02 2 12s1.89 6.39 3.812 6.56c.31.11.63.17 1.002.17.48 0 .96-.06 1.44-.17 1.2-.28 2.4-.42 3.6-.42s2.4.14 3.6.42c.48.11.96.17 1.44.17.372 0 .692-.06 1.002-.17C20.11 18.39 22 16.98 22 12s-1.89-6.39-3.812-6.56zM10 15.5v-7L16 12l-6 3.5z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="w-4 h-4" />
            <span>(47) 3248-2841</span>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image src="/images/rieger-logo.png" alt="Rieger Imóveis Logo" width={150} height={40} />
        </Link>
        <nav className="hidden md:flex space-x-6 lg:space-x-8 items-center">
          <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
            INICIAL
          </Link>
          <Link href="/imoveis" className="text-gray-700 hover:text-blue-600 font-medium">
            IMÓVEIS
          </Link>
          <Link href="/sobre" className="text-gray-700 hover:text-blue-600 font-medium">
            SOBRE NÓS
          </Link>
          <Link href="/servicos" className="text-gray-700 hover:text-blue-600 font-medium">
            SERVIÇOS
          </Link>
          <Link href="/temporada" className="text-gray-700 hover:text-blue-600 font-medium">
            TEMPORADA
          </Link>
          <Link href="/crm" className="text-yellow-500 hover:text-yellow-600 font-medium ml-auto">
            Área do Corretor
          </Link>
        </nav>
        <div className="md:hidden">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 py-6">
                <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium" onClick={handleNavLinkClick}>
                  INICIAL
                </Link>
                <Link
                  href="/imoveis"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={handleNavLinkClick}
                >
                  IMÓVEIS
                </Link>
                <Link
                  href="/sobre"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={handleNavLinkClick}
                >
                  SOBRE NÓS
                </Link>
                <Link
                  href="/servicos"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={handleNavLinkClick}
                >
                  SERVIÇOS
                </Link>
                <Link
                  href="/temporada"
                  className="text-gray-700 hover:text-blue-600 font-medium"
                  onClick={handleNavLinkClick}
                >
                  TEMPORADA
                </Link>
                <Link
                  href="/crm"
                  className="text-yellow-500 hover:text-yellow-600 font-medium"
                  onClick={handleNavLinkClick}
                >
                  Área do Corretor
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
