import { NextRequest, NextResponse } from "next/server";
import { generateRevenueProof, verifyRevenueProof, computeRevenueCommitment } from "@/lib/zk/zkEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "commit") {
      const { revenue, salt, merchantAddress } = body;
      if (!revenue || !salt || !merchantAddress) {
        return NextResponse.json({ error: "Missing revenue, salt, or merchantAddress" }, { status: 400 });
      }
      const commitment = computeRevenueCommitment(Number(revenue), String(salt), String(merchantAddress));
      return NextResponse.json({ commitment });
    }

    if (action === "prove") {
      const { witness, minThreshold } = body;
      if (!witness || !minThreshold) {
        return NextResponse.json({ error: "Missing witness or minThreshold" }, { status: 400 });
      }
      const proof = generateRevenueProof(witness, Number(minThreshold));
      return NextResponse.json({ success: true, proof });
    }

    if (action === "verify") {
      const { proof, expectedInputs } = body;
      if (!proof) {
        return NextResponse.json({ error: "Missing proof" }, { status: 400 });
      }
      const result = verifyRevenueProof(proof, expectedInputs);
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Unknown action. Supported: commit, prove, verify" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "ZK processing failure" }, { status: 500 });
  }
}
