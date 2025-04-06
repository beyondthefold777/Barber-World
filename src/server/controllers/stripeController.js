const Subscription = require('../models/subscription.model');
const User = require('../models/user.model');
const Shop = require('../models/shop.model');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Log Stripe configuration on startup
console.log('Stripe Environment:', process.env.NODE_ENV);
console.log('Stripe Key Type:', process.env.STRIPE_SECRET_KEY.startsWith('sk_test_') ? 'TEST' : 'LIVE');
console.log('Stripe Price ID:', process.env.STRIPE_PRICE_ID);

// Create a Stripe customer and start a trial subscription
// Update the createTrialSubscription function to handle the payment method ID
exports.createTrialSubscription = async (req, res) => {
  console.log('createTrialSubscription called with body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { 
      shopName, 
      ownerName, 
      email, 
      phone, 
      address, 
      numberOfChairs,
      paymentMethodId 
    } = req.body;
    
    console.log('Validating input data...');
    if (!email || !ownerName || !paymentMethodId) {
      console.error('Missing required fields:', { email, ownerName, paymentMethodId: !!paymentMethodId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    // Check if user already exists
    console.log('Checking if user exists:', email);
    let user = await User.findOne({ email });
    
    if (user) {
      console.log('User already exists:', user._id);
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    console.log('Creating Stripe customer...');
    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: ownerName,
      phone,
      address: {
        line1: address
      }
    });
    
    console.log('Stripe customer created:', customer.id);
    
    // Attach the payment method to the customer
    console.log('Attaching payment method to customer...');
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id,
    });
    
    // Set as default payment method
    console.log('Setting payment method as default...');
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    // Verify price ID exists
    if (!process.env.STRIPE_PRICE_ID) {
      console.error('STRIPE_PRICE_ID not set in environment variables');
      return res.status(500).json({
        success: false,
        message: 'Server configuration error: Price ID not set'
      });
    }
    
    console.log('Creating subscription with price ID:', process.env.STRIPE_PRICE_ID);
    // Create a subscription with a trial period
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        { price: process.env.STRIPE_PRICE_ID }
      ],
      trial_period_days: 14,
      expand: ['latest_invoice.payment_intent']
    });
    
    console.log('Stripe subscription created:', subscription.id);
    console.log('Subscription status:', subscription.status);
    console.log('Trial end:', new Date(subscription.trial_end * 1000));
    
    console.log('Creating user in database...');
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
    
    const savedUser = await user.save();
    console.log('User created in database:', savedUser._id);
    console.log('Creating shop in database...');
    // Create a new shop
    const shop = new Shop({
      name: shopName || `${ownerName}'s Barbershop`, // Use provided name or create a default
      userId: user._id,
      location: {
        address,
      },
      numberOfChairs: parseInt(numberOfChairs) || 1
    });
    const savedShop = await shop.save();
    console.log('Shop created in database:', savedShop._id);
    console.log('Creating subscription record in database...');
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
    const savedSubscription = await subscriptionRecord.save();
    console.log('Subscription saved to database:', savedSubscription._id);
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
    
    // Log more details about Stripe errors
    if (error.type && error.type.startsWith('Stripe')) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        param: error.param,
        detail: error.detail
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create trial subscription',
      error: error.message
    });
  }
};

// Get subscription status
exports.getSubscriptionStatus = async (req, res) => {
  console.log('getSubscriptionStatus called for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    
    console.log('Finding subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }
    
    console.log('Found subscription:', subscription._id);
    console.log('Retrieving subscription from Stripe:', subscription.stripeSubscriptionId);
    
    // Get the latest subscription data from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(
      subscription.stripeSubscriptionId
    );
    
    console.log('Stripe subscription retrieved:', stripeSubscription.id);
    console.log('Stripe subscription status:', stripeSubscription.status);
    
    // Update local subscription data
    subscription.status = stripeSubscription.status;
    subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
    subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
    
    const updatedSubscription = await subscription.save();
    console.log('Updated subscription in database:', updatedSubscription._id);
    
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
  console.log('cancelSubscription called for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    
    console.log('Finding subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }
    
    console.log('Found subscription:', subscription._id);
    console.log('Canceling subscription in Stripe:', subscription.stripeSubscriptionId);
    
    // Cancel the subscription at period end
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: true }
    );
    
    console.log('Stripe subscription updated:', stripeSubscription.id);
    console.log('Cancel at period end:', stripeSubscription.cancel_at_period_end);
    
    // Update local subscription data
    subscription.cancelAtPeriodEnd = true;
    const updatedSubscription = await subscription.save();
    console.log('Updated subscription in database:', updatedSubscription._id);
    
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
  console.log('resumeSubscription called for user:', req.user.id);
  
  try {
    const userId = req.user.id;
    
    console.log('Finding subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }
    
    console.log('Found subscription:', subscription._id);
    console.log('Resuming subscription in Stripe:', subscription.stripeSubscriptionId);
    
    // Resume the subscription
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripeSubscriptionId,
      { cancel_at_period_end: false }
    );
    
    console.log('Stripe subscription updated:', stripeSubscription.id);
    console.log('Cancel at period end:', stripeSubscription.cancel_at_period_end);
    
    // Update local subscription data
    subscription.cancelAtPeriodEnd = false;
    const updatedSubscription = await subscription.save();
    console.log('Updated subscription in database:', updatedSubscription._id);
    
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
  console.log('updatePaymentMethod called for user:', req.user.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const userId = req.user.id;
    const { paymentMethodId } = req.body;
    
    if (!paymentMethodId) {
      console.error('Missing payment method ID');
      return res.status(400).json({
        success: false,
        message: 'Payment method ID is required'
      });
    }
    
    console.log('Finding subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }
    
    console.log('Found subscription:', subscription._id);
    console.log('Attaching payment method to customer:', subscription.stripeCustomerId);
    
    // Attach the payment method to the customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: subscription.stripeCustomerId,
    });
    
    console.log('Setting as default payment method');
    // Set as default payment method
    await stripe.customers.update(subscription.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    
    console.log('Payment method updated successfully');
    
    res.status(200).json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    
    // Log more details about Stripe errors
    if (error.type && error.type.startsWith('Stripe')) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        param: error.param,
        detail: error.detail
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update payment method',
      error: error.message
    });
  }
};

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
  console.log('createPaymentIntent called for user:', req.user.id);
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { amount, currency = 'usd' } = req.body;
    
    if (!amount) {
      console.error('Missing amount');
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }
    
    const userId = req.user.id;
    
    console.log('Finding subscription for user:', userId);
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      console.log('No subscription found for user:', userId);
      return res.status(404).json({
        success: false,
        message: 'No subscription found for this user'
      });
    }
    
    console.log('Creating payment intent for amount:', amount, currency);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      customer: subscription.stripeCustomerId,
      setup_future_usage: 'off_session',
    });
    
    console.log('Payment intent created:', paymentIntent.id);
    
    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    
    // Log more details about Stripe errors
    if (error.type && error.type.startsWith('Stripe')) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        param: error.param,
        detail: error.detail
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create payment intent',
      error: error.message
    });
  }
};

// Handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  console.log('handleWebhook called');
  const sig = req.headers['stripe-signature'];
  
  let event;
  try {
    console.log('Verifying webhook signature');
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook event verified:', event.type);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  console.log('Processing webhook event:', event.type);
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
  console.log('Webhook processing completed');
  res.status(200).json({ received: true });
};

// Helper functions for webhook event handling
async function handleSubscriptionUpdated(subscription) {
  console.log('handleSubscriptionUpdated called for subscription:', subscription.id);
  try {
    console.log('Finding subscription in database');
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (subscriptionRecord) {
      console.log('Subscription found in database:', subscriptionRecord._id);
      console.log('Updating subscription status from', subscriptionRecord.status, 'to', subscription.status);
      
      subscriptionRecord.status = subscription.status;
      subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      const updatedSubscription = await subscriptionRecord.save();
      console.log('Subscription updated in database:', updatedSubscription._id);
      console.log(`Subscription ${subscription.id} updated to status: ${subscription.status}`);
    } else {
      console.log(`No subscription record found in database for Stripe subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated event:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('handleSubscriptionDeleted called for subscription:', subscription.id);
  try {
    console.log('Finding subscription in database');
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (subscriptionRecord) {
      console.log('Subscription found in database:', subscriptionRecord._id);
      console.log('Updating subscription status from', subscriptionRecord.status, 'to canceled');
      
      subscriptionRecord.status = 'canceled';
      const updatedSubscription = await subscriptionRecord.save();
      console.log('Subscription updated in database:', updatedSubscription._id);
      console.log(`Subscription ${subscription.id} marked as canceled`);
    } else {
      console.log(`No subscription record found in database for Stripe subscription: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription deleted event:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('handleInvoicePaymentSucceeded called for invoice:', invoice.id);
  try {
    if (invoice.subscription) {
      console.log('Invoice is for subscription:', invoice.subscription);
      console.log('Finding subscription in database');
      
      const subscriptionRecord = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });
      
      if (subscriptionRecord) {
        console.log('Subscription found in database:', subscriptionRecord._id);
        
        // Update subscription status if needed
        if (subscriptionRecord.status !== 'active') {
          console.log('Updating subscription status from', subscriptionRecord.status, 'to active');
          
          subscriptionRecord.status = 'active';
          const updatedSubscription = await subscriptionRecord.save();
          console.log('Subscription updated in database:', updatedSubscription._id);
          console.log(`Subscription ${invoice.subscription} activated after payment`);
        } else {
          console.log('Subscription already active, no status update needed');
        }
      } else {
        console.log(`No subscription record found in database for Stripe subscription: ${invoice.subscription}`);
      }
    } else {
      console.log('Invoice is not associated with a subscription');
    }
  } catch (error) {
    console.error('Error handling invoice payment succeeded event:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('handleInvoicePaymentFailed called for invoice:', invoice.id);
  try {
    if (invoice.subscription) {
      console.log('Invoice is for subscription:', invoice.subscription);
      console.log('Finding subscription in database');
      
      const subscriptionRecord = await Subscription.findOne({
        stripeSubscriptionId: invoice.subscription
      });
      
      if (subscriptionRecord) {
        console.log('Subscription found in database:', subscriptionRecord._id);
        
        // Update subscription status if needed
        if (subscriptionRecord.status === 'active') {
          console.log('Updating subscription status from active to past_due');
          
          subscriptionRecord.status = 'past_due';
          const updatedSubscription = await subscriptionRecord.save();
          console.log('Subscription updated in database:', updatedSubscription._id);
          console.log(`Subscription ${invoice.subscription} marked as past_due after failed payment`);
        } else {
          console.log('Subscription not active, current status:', subscriptionRecord.status);
        }
      } else {
        console.log(`No subscription record found in database for Stripe subscription: ${invoice.subscription}`);
      }
    } else {
      console.log('Invoice is not associated with a subscription');
    }
  } catch (error) {
    console.error('Error handling invoice payment failed event:', error);
  }
}

