"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface Props {
  certificateUrl: string;
  courseName: string;
}

export function CertificateDownload({ certificateUrl, courseName }: Props) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = certificateUrl;
    link.download = `${courseName.replace(/\s+/g, "-")}-certificado.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <Button variant="outline" onClick={handleDownload}>
      <Download className="w-4 h-4" />
      Descargar certificado
    </Button>
  );
}
