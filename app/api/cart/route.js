import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Update user cart
export async function POST(request) {
  try {
    const { userId } = getAuth(request);
    const { cart } = await request.json();

    // save the cart to the user obj
    await prisma.user.update({
      where: { id: userId },
      data: { cart: cart },
    });
    return NextResponse.json({ message: "Cart Updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: error.message}, {status: 400});
  }
}

// Get user cart
export async function GEt(request) {
  try {
    const { userId } = getAuth(request);
    const user = await prisma.user.findUnique({
        where:{id:userId}
    })
    return NextResponse.json({ cart:user.cart });
  } catch (error) {
    console.error(error);
    return NextResponse.json({error: error.message}, {status: 400});
  }
}