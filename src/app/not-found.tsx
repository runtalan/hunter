import Link from "next/link";
import { Button } from "@/components/ui";
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-[40ch]">
        <div className="text-[22px] font-semibold tracking-tight">Nothing here</div>
        <p className="text-muted text-[13.5px] mt-2">The record you're looking for isn't in the index. It may belong to a tenant outside your grants.</p>
        <Link href="/" className="inline-block mt-5"><Button variant="primary">Back to overview</Button></Link>
      </div>
    </div>
  );
}
