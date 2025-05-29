"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export default function AnnouncementPopup() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem("hasSeenDomainChangePopup");
    if (!hasSeenPopup) {
      setIsOpen(true);
      localStorage.setItem("hasSeenDomainChangePopup", "true");
    }
  }, []);

  const handleRedirect = () => {
    window.location.href = "https://orbitx.xyz";
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-[#1a1f2e] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🚀 We’ve Moved!
          </DialogTitle>
          <DialogDescription className="text-gray-300">
            Airdrop Dashboard sekarang di{" "}
            <a
              href=""
              className="underline text-blue-400 hover:text-blue-300"
            >
              orbitx.xyz
            </a>
            ! Bookmark domain baru dan lanjut track airdrop-mu.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-400">
            Mulai 1-30 Juni 2025, domain lama gak aktif lagi. Pindah sekarang biar gak ketinggalan!
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Nanti Dulu
          </Button>
          <Button
            className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 opacity-50 cursor-not-allowed"
            onClick={handleRedirect}
            disabled // Tambah prop disabled
          >
            Ke Domain Baru
            <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:scale-125" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}