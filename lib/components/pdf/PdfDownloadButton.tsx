"use client";

import React, { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { CateringMenuPdf, CateringMenuPdfProps } from "./CateringMenuPdf";

interface PdfDownloadButtonProps extends CateringMenuPdfProps {
  filename?: string;
  className?: string;
  children?: React.ReactNode;
}

export const PdfDownloadButton: React.FC<PdfDownloadButtonProps> = ({
  sessions,
  showPrices,
  deliveryCharge,
  totalPrice,
  logoUrl,
  filename = "catering-menu.pdf",
  className,
  children,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <CateringMenuPdf
          sessions={sessions}
          showPrices={showPrices}
          deliveryCharge={deliveryCharge}
          totalPrice={totalPrice}
          logoUrl={logoUrl}
        />
      ).toBlob();

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className={
        className ||
        "btn btn-primary"
      }
    >
      {isGenerating ? (
        <>
          <span className="loading loading-spinner loading-sm"></span>
          Generating...
        </>
      ) : (
        children || "Download Menu PDF"
      )}
    </button>
  );
};

export default PdfDownloadButton;
