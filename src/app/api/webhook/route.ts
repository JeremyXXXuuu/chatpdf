import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { userSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function POST(request: NextRequest) {
    const body = await request.text();
    console.log(body);
    const signature = request.headers.get("stripe-signature") as string;
    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err) {
        console.error(err);
        return new Response("Webhook Error", { status: 400 });
    }
    const session = event.data.object as Stripe.Checkout.Session;

    // new subscription created
    if(event.type === "checkout.session.completed") {
        console.log("checkout.session.completed");
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        console.log(subscription);
        if(!session?.metadata?.userId) {
            return new Response("Missing userId metadata", { status: 400 });
        }

        console.log("inserting subscription");
        await db.insert(userSubscriptions).values({
            userId: session.metadata.userId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          });
    }
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await db
          .update(userSubscriptions)
          .set({
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          })
          .where(eq(userSubscriptions.stripeSubscriptionId, subscription.id));
      }
      return new NextResponse(null, { status: 200 })
}