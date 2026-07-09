import { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import { API_URL } from "@/lib/db";

interface ActiveBatch {
  id: string;
  label: string;
  quantity: number;
  remaining: number;
}

interface StockBatchResponse {
  active_batch: ActiveBatch | null;
  total_batches: number;
}

interface Props {
  productId: string;
}

export default function StockBatchBadge({ productId }: Props) {
  const [data, setData] = useState<StockBatchResponse | null>(null);

  useEffect(() => {
    if (!productId) return;
    fetch(`${API_URL}/api/stock-batches/${productId}`)
      .then((res) => res.json())
      .then((resData: StockBatchResponse) => setData(resData))
      .catch((err) => console.error("Error loading stock batch:", err));
  }, [productId]);

  if (!data || !data.active_batch) return null;

  const { remaining, label } = data.active_batch;

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider animate-pulse shadow-sm">
      <AlertCircle className="h-4 w-4 text-amber-600" />
      <span>
        {label}: Only <strong className="font-extrabold text-amber-950">{remaining}</strong> left in stock!
      </span>
    </div>
  );
}
