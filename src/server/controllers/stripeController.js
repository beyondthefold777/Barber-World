const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const Shop = require('../models/shop.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a Stripe customer and start a trial subscription
exports.createTrialSubscription = async (req, res) => {
  try {
    const { 
      shopName, 
      ownerName, 
      email, 
      phone, 
      address, 
      numberOfChairs,
      cardToken 
    } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: ownerName,
      phone,
      address: {
        line1: address
      },
      payment_method: cardToken,
      invoice_settings: {
        default_payment_method: cardToken
      }
    });

    // Create a subscription with a trial period
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        { price: process.env.STRIPE_PRICE_ID }
      ],
      trial_period_days: 14,
      expand: ['latest_invoice.payment_intent']
    });

    // Create a new user
    user = new User({
      firstName: ownerName.split(' ')[0],
      lastName: ownerName.split(' ').slice(1).join(' '),
      email,
      phone,
      role: 'shop_owner'
    });

    // Set a temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    user.setPassword(tempPassword);

    await user.save();

    // Create a new shop
    const shop = new Shop({
      name: shopName,
      userId: user._id,
      location: {
        address,
      },
      numberOfChairs: parseInt(numberOfChairs) || 1
    });

    await shop.save();

    // Create subscription record
    const subscriptionRecord = new Subscription({
      userId: user._id,
      shopId: shop._id,
      stripeCustomerId: customer.id,
      stripeSubscriptionId: subscription.id,
      status: subscription.status,
      trialEndDate: new Date(subscription.trial_end * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000)
    });

    await subscriptionRecord.save();

    res.status(201).json({
      success: true,
      message: 'Trial subscription created successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          tempPassword
        },
        shop: {
          id: shop._id,
          name: shop.name
        },
        subscription: {
          id: subscriptionRecord._id,
          status: subscriptionRecord.status,
          trialEndDate: subscriptionRecord.trialEndDate
        }
      }
    });
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create trial subscription',
      error: error.message
    });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Get the latest subscription data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );

    // Update local subscription data
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    
    await subscription.save();

    res.status(200).json({
      success: true,
      data: {
        status: subscription.status,
        trialEndDate: subscription.trialEndDate,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error getting subscription status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Cancel the subscription at period end
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Update local subscription data
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      data: {
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
        currentPeriodEnd: subscription.currentPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel subscription',
      error: error.message
    });
  }
};

// Resume canceled subscription
exports.resumeSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Resume the subscription
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    // Update local subscription data
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    res.status(200).json({
      success: true,
      message: 'Subscription resumed successfully',
      data: {
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resume subscription',
      error: error.message
    });
  }
};

// Update payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;
    
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }

    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: error.message
    });
  }
};

// Handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
    case 'invoice.payment_succeeded':
      await handleInvoicePaymentSucceeded(event.data.object);
      break;
    case 'invoice.payment_failed':
      await handleInvoicePaymentFailed(event.data.object);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
};

// Helper functions for webhook event handling
async function handleSubscriptionUpdated(subscription) {
  try {
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
      subscriptionRecord.status = subscription.status;
      subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      await subscriptionRecord.save();
      console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated event:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  try {
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });

    if (subscriptionRecord) {
      subscriptionRecord.status = 'canceled';
      await subscriptionRecord.save();
      console.log(`Subscription ${subscription.id} marked as canceled`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted event:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  try {
    if (invoice.subscription) {
      const subscriptionRecord = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (subscriptionRecord) {
        // Update subscription status if needed
        if (subscriptionRecord.status !== 'active') {
          subscriptionRecord.status = 'active';
          await subscriptionRecord.save();
          console.log(`Subscription ${invoice.subscription} activated after payment`);
        }
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded event:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  try {
    if (invoice.subscription) {
      const subscriptionRecord = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });

      if (subscriptionRecord) {
        // Update subscription status if needed
        if (subscriptionRecord.status === 'active') {
          subscriptionRecord.status = 'past_due';
          await subscriptionRecord.save();
          console.log(`Subscription ${invoice.subscription} marked as past_due after failed payment`);
        }
      }
    }
  } catch (error) {
    console.error('Error handling invoice payment failed event:', error);
  }
}
