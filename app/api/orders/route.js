import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function POST(request) {
    try {
        const {userId, has} = getAuth(request)
        if(!userId){
            return NextResponse.json({error: "not authorized"},{status: 401})
        }
        const {addressId, items, couponCode, paymentMethod} = await request.json()
        // check if all required fields are present
        if(!addressId || !paymentMethod || !items || !Array.isArray(items) || items.length===0){
            return NextResponse.json({error: "missing order details"},{status: 400})
        }
        let coupon = null;
        if(couponCode){
            coupon = await prisma.coupon.findUnique({
            where:{code:couponCode}
        })
        if(!coupon){
            return NextResponse.json({error:"Coupon not found"},{status:400})
        }
        }
        // Check if coupon is applicable for new users
        if(couponCode && coupon.forNewUser){
            const userorders = await prisma.order.findMany({where:{userId}})
            if(userorders.length > 0){
                return NextResponse.json({error:"Coupon valid for new users"},{status:400})
            }
        }

        const isPlusMember = has({plan:'plus'})
        // check if coupon is applicable for members
        if(couponCode && coupon.forMember){
            if(!isPlusMember){
                return NextResponse.json({error:"Coupon valid for members only"},{status:400})
            }
        }

        // Group orders by storeId using a Map
        const ordersByStore = new Map()
        for(const item of items){
            const product = await prisma.findUnique({where:{id:item.id}})
            const storeId = product.storeId
            if(!ordersByStore.has(storeId)){
                ordersByStore.set(storeId, [])
            }
            ordersByStore.get(storeId).push({...item,price:product.price})
        }

        let orderIds = [];
        let fullAmount = 0;
        let isShippingFeeAdded = false;
        
        // Create orders for each seller
        for(const[storeId,sellerItems] of ordersByStore.entries()){
            let total = sellerItems.reduce((acc,item)=>acc+(item.price * item.quantity),0)

            if(couponCode){
                total -= (total * coupon.discount) / 100;
            }
            if(!isPlusMember && !isShippingFeeAdded){
                total += 80;  
                isShippingFeeAdded = true;
            }
            fullAmount += parseFloat(total.toFixed(2))

            const order = await prisma.order.create({
                data:{
                    userId,
                    storeId,
                    addressId,
                    total: parseFloat(total.toFixed(2)),
                    paymentMethod,
                    isCouponUsed:coupon?true:false,
                    coupon:coupon?coupon:{},
                    orderItems:{
                        create:sellerItems.map(items => ({
                            productId: item.id,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                }
            })
            orderIds.push(order.id)
        }

        // clear the cart 
        await prisma.user.update({
            where:{id:userId},
            data:{cart:{}}
        })

        return NextResponse.json({message:"Order Placed Successfully"})

    } catch (error) {
        console.error(error)
        return NextResponse.json({error: error.code || error.message}, {status: 400});      
    }
}

// Get all orders for a user
