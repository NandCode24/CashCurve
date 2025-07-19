"use client";

import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Props: onImport(parsedRows: array)
export function CSVImport({ onImport }) {
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const handleCSVImport = (file) => {
        if (!file.name.endsWith(".csv")) {
            toast.error("Please select a CSV file.");
            return;
        }
        setLoading(true);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                setLoading(false);

                if (results.errors.length > 0) {
                    toast.error("Failed to parse CSV. Please check file format.");
                    return;
                }

                if (typeof onImport === "function") onImport(results.data);
                toast.success("CSV imported successfully!");
            },
            error: () => {
                setLoading(false);
                toast.error("Failed to parse CSV file.");
            },
        });
    };

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleCSVImport(file);
                }}
            />
            <Button
                type="button"
                variant="outline"
                className="w-full h-10 bg-gradient-to-br from-green-600 via-blue-500 to-blue-800 animate-gradient hover:opacity-90 transition-opacity text-white hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 animate-spin" />
                        <span>Importing CSV...</span>
                    </>
                ) : (
                    <>
                        <Upload className="mr-2" />
                        <span>Import CSV</span>
                    </>
                )}
            </Button>
        </div>
    );
}
