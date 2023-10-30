// api/stripe

import { auth } from "@/app/auth/index";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { stripe } from "@/lib/stripe";


const return_url = process.env.NEXT_BASE_URL + "/";
export async function GET() {
    const { user, userId } = await auth();
    console.log(user);
    if (!userId) return NextResponse.error();
    try {
        const _userSubscriptions = await db.select().from(userSubscriptions).where(eq(userSubscriptions.userId, userId));
        if(_userSubscriptions[0] && _userSubscriptions[0].stripeCustomerId) {
            console.log("has subscription");
            // trying to cancel at the billing portal
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: _userSubscriptions[0].stripeCustomerId,
                return_url,
            });
            return NextResponse.json({ url: stripeSession.url });
        }
        console.log("no subscription");
        // user has no subscription and is trying to subscribe
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: return_url,
            cancel_url: return_url,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user?.email,
            line_items: [
              {
                price_data: {
                  currency: "USD",
                  product_data: {
                    name: "ChatPDF Pro",
                    description: "Unlimited PDF sessions!",
                  },
                  unit_amount: 2000,
                  recurring: {
                    interval: "month",
                  },
                },
                quantity: 1,
              },
            ],
            metadata: {
              userId,
            },
        });
        return NextResponse.json({ url: stripeSession.url });
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }      
}