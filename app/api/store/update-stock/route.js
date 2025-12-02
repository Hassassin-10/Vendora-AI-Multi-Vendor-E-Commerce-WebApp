import prisma from "@/lib/prisma";
import authSeller from "@/middlewares/authSeller";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const storeId = await authSeller(userId);

    if (!storeId) {
      return NextResponse.json({ error: "not authorized" }, { status: 401 });
    }

    const { productId, stock } = await request.json();

    if (!productId || stock === undefined) {
      return NextResponse.json(
        { error: "missing product or stock details" },
        { status: 400 }
      );
    }

    // Verify the product belongs to this seller's store
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { storeId: true },
    });

    if (!product || product.storeId !== storeId) {
      return NextResponse.json(
        { error: "product not found or not authorized" },
        { status: 404 }
      );
    }

    // Update the product stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: Math.max(0, stock),
        inStock: stock > 0,
      },
    });

    return NextResponse.json({
      message: "stock updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
