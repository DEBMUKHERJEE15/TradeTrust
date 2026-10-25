import { NextRequest, NextResponse } from "next/server";
import { bitrefillAdapter } from "@/lib/commerce/bitrefillAdapter";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || undefined;
  const category = searchParams.get("category") || undefined;
  const maxBudget = searchParams.get("maxBudget") ? Number(searchParams.get("maxBudget")) : undefined;

  const status = bitrefillAdapter.getStatus();
  const products = await bitrefillAdapter.discoverProducts({ query, category, maxBudget });

  return NextResponse.json({
    status,
    count: products.length,
    products,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "propose") {
      const { productId, quantity, recipientIdentifier, merchantAddress, spendingLimitRemaining, merchantBudget } = body;
      const proposal = bitrefillAdapter.prepareProposal({
        productId,
        quantity: Number(quantity) || 1,
        recipientIdentifier: recipientIdentifier || "merchant@apexprovisions.com",
        merchantAddress: merchantAddress || "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        spendingLimitRemaining: Number(spendingLimitRemaining) || 380,
        merchantBudget: Number(merchantBudget) || 500,
      });

      return NextResponse.json({ success: true, proposal });
    }

    if (action === "execute") {
      const { proposal, merchantConsentConfirmed } = body;
      if (!proposal) {
        return NextResponse.json({ error: "Missing purchase proposal." }, { status: 400 });
      }

      if (!merchantConsentConfirmed) {
        return NextResponse.json(
          { error: "Action rejected: Merchant must explicitly approve the purchase proposal before execution." },
          { status: 403 }
        );
      }

      const orderResult = await bitrefillAdapter.executeApprovedPurchase(proposal, merchantConsentConfirmed);
      return NextResponse.json({ success: true, orderResult });
    }

    return NextResponse.json({ error: "Invalid action. Supported: propose, execute" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Commerce processing error" }, { status: 400 });
  }
}
