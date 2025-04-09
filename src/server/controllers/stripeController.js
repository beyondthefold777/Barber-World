// Load environment variables if not already loaded
if (!process.env.STRIPE_SECRET_KEY) {
  require('dotenv').config();
}

// Check if STRIPE_SECRET_KEY exists and log appropriate message
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Subscription = require('../models/subscription.model');
const User = require('../models/User');

// Create a checkout session for subscription
exports.createCheckoutSession = async (req, res) => {
  try {
    const { userId, planType } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({
      userId
    });
    
    if (existingSubscription && existingSubscription.status === 'active') {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }
    
    // Use the price ID from environment variables
    const priceId = process.env.STRIPE_PRICE_ID;
    
    // Create or retrieve Stripe customer
    let stripeCustomerId;
    
    if (user.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      });
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'https://barberworld.app'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL || 'https://barberworld.app'}/subscription/cancel`,
      metadata: {
        userId: userId,
        planType: planType
      }
    });
    
    res.status(200).json({
      success: true,
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating checkout session',
      error: error.message
    });
  }
};

// Create a trial subscription with payment method
exports.createTrial = async (req, res) => {
  try {
    const { 
      userId, 
      planType = 'monthly', 
      paymentMethodId, 
      name, 
      email, 
      address, 
      city, 
      state, 
      zipCode, 
      country = 'US' 
    } = req.body;
    
    console.log('Received trial signup request:', {
      userId,
      planType,
      hasPaymentMethod: !!paymentMethodId,
      address,
      city,
      state,
      zipCode
    });

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found with ID:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if user already has a subscription
    const existingSubscription = await Subscription.findOne({
      userId
    });
    
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has a subscription'
      });
    }
    
    // Create or retrieve Stripe customer
    let stripeCustomerId;
    
    if (user.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
      
      // If payment method provided, attach it to the customer
      if (paymentMethodId) {
        try {
          // Attach the payment method to the customer
          await stripe.paymentMethods.attach(paymentMethodId, {
            customer: stripeCustomerId,
          });
          
          // Set as default payment method
          await stripe.customers.update(stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          });
          console.log('Payment method attached to existing customer');
        } catch (err) {
          console.error('Error attaching payment method:', err);
          // Continue with subscription creation even if payment method attachment fails
        }
      }
    } else {
      // Create a new customer
      const customerData = {
        email: email || user.email,
        name: name || `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString()
        }
      };
      
      // Add address if all fields are provided
      if (address && city && state && zipCode) {
        customerData.address = {
          line1: address,
          city: city,
          state: state,
          postal_code: zipCode,
          country: country
        };
      }
      
      // If payment method provided, add it to customer creation
      if (paymentMethodId) {
        customerData.payment_method = paymentMethodId;
        customerData.invoice_settings = {
          default_payment_method: paymentMethodId
        };
      }
      
      const customer = await stripe.customers.create(customerData);
      
      stripeCustomerId = customer.id;
      
      // Update user with Stripe customer ID
      user.stripeCustomerId = stripeCustomerId;
    }
    
    // Update user fields if they exist in the request
    // Using findByIdAndUpdate to avoid validation errors
    const updateFields = {};
    if (address) updateFields.address = address;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (zipCode) updateFields.zipCode = zipCode;
    if (country) updateFields.country = country;
    if (stripeCustomerId) updateFields.stripeCustomerId = stripeCustomerId;
    
    // Only update if there are fields to update
    if (Object.keys(updateFields).length > 0) {
      await User.findByIdAndUpdate(userId, updateFields, {
         new: true,
        runValidators: false // Skip validation
      });
    }
    
    // Use the price ID from environment variables
    const priceId = process.env.STRIPE_PRICE_ID;
    
    // Create a subscription with a trial period
    console.log('Creating subscription with trial for customer:', stripeCustomerId);
    try {
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomerId,
        items: [{ price: priceId }],
        trial_period_days: 14,
        metadata: {
          userId: userId,
          planType: planType
        }
      });
      
      console.log('Subscription created successfully:', subscription.id);
      
      // Calculate trial end date
      let trialEndDate = new Date();
      if (subscription.trial_end && typeof subscription.trial_end === 'number') {
        trialEndDate = new Date(subscription.trial_end * 1000);
      } else {
        // Fallback: set trial end date to current date + 14 days
        trialEndDate.setDate(trialEndDate.getDate() + 14);
      }
      
      // Ensure current_period_end is a valid timestamp before converting to Date
      let currentPeriodEnd;
      if (subscription.current_period_end && typeof subscription.current_period_end === 'number') {
        currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      } else {
        // Fallback: set current period end to trial end date + 30 days
        currentPeriodEnd = new Date(trialEndDate);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
      }
      
      // Validate dates before creating subscription record
      if (isNaN(trialEndDate.getTime())) {
        console.error('Invalid trial end date detected, using current date + 14 days');
        trialEndDate = new Date();
        trialEndDate.setDate(trialEndDate.getDate() + 14);
      }
      
      if (isNaN(currentPeriodEnd.getTime())) {
        console.error('Invalid current period end date detected, using trial end date + 30 days');
        currentPeriodEnd = new Date(trialEndDate);
        currentPeriodEnd.setDate(currentPeriodEnd.getDate() + 30);
      }
      
      // Create subscription in database
      const subscriptionRecord = await Subscription.create({
        userId,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        planType,
        trialEndDate,
        currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
      
      console.log('Subscription record created in database:', subscriptionRecord._id);
      
      res.status(200).json({
        success: true,
        message: 'Trial subscription created successfully',
        subscription: {
          id: subscriptionRecord._id,
          status: subscriptionRecord.status,
          trialEndDate: subscriptionRecord.trialEndDate,
          currentPeriodEnd: subscriptionRecord.currentPeriodEnd
        }
      });
    } catch (subscriptionError) {
      console.error('Error creating Stripe subscription:', subscriptionError);
      res.status(500).json({
        success: false,
        message: 'Error creating trial subscription',
        error: subscriptionError.message
      });
    }
  } catch (error) {
    console.error('Error creating trial subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating trial subscription',
      error: error.message
    });
  }
};



// Handle subscription success
exports.handleSubscriptionSuccess = async (req, res) => {
  try {
    const { session_id } = req.query;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        message: 'Session ID is required'
      });
    }
    
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Get metadata from the session
    const { userId, planType } = session.metadata;
    
    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    // Create or update subscription in database
    let subscriptionRecord = await Subscription.findOne({
      userId
    });
    
    if (subscriptionRecord) {
      // Update existing subscription
      subscriptionRecord.stripeCustomerId = session.customer;
      subscriptionRecord.stripeSubscriptionId = session.subscription;
      subscriptionRecord.status = subscription.status;
      subscriptionRecord.planType = planType || 'monthly';
      subscriptionRecord.trialEndDate = trialEndDate;
      subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      await subscriptionRecord.save();
    } else {
      // Create new subscription
      subscriptionRecord = await Subscription.create({
        userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: subscription.status,
        planType: planType || 'monthly',
        trialEndDate: trialEndDate,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
    }
    
    res.status(200).json({
      success: true,
      subscription: {
        id: subscriptionRecord._id,
        status: subscriptionRecord.status,
        currentPeriodEnd: subscriptionRecord.currentPeriodEnd,
        trialEndDate: subscriptionRecord.trialEndDate
      }
    });
  } catch (error) {
    console.error('Error handling subscription success:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling subscription success',
      error: error.message
    });
  }
};

// Get subscription details
exports.getSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find subscription in database
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Get latest subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    
    // Update subscription in database if needed
    if (subscription.status !== stripeSubscription.status || 
        subscription.cancelAtPeriodEnd !== stripeSubscription.cancel_at_period_end ||
        new Date(subscription.currentPeriodEnd).getTime() !== new Date(stripeSubscription.current_period_end * 1000).getTime()) {
        
        subscription.status = stripeSubscription.status;
        subscription.cancelAtPeriodEnd = stripeSubscription.cancel_at_period_end;
        subscription.currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
        
        await subscription.save();
    }
    
    res.status(200).json({
      success: true,
      subscription: {
        id: subscription._id,
        status: subscription.status,
        planType: subscription.planType,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEndDate: subscription.trialEndDate,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error getting subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting subscription',
      error: error.message
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find subscription in database
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Update subscription in Stripe to cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update subscription in database
    subscription.cancelAtPeriodEnd = true;
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error canceling subscription',
      error: error.message
    });
  }
};

// Reactivate subscription
exports.reactivateSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }
    
    // Find subscription in database
    const subscription = await Subscription.findOne({ userId });
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }
    
    // Check if subscription is set to cancel
    if (!subscription.cancelAtPeriodEnd) {
      return res.status(400).json({
        success: false,
        message: 'Subscription is not scheduled for cancellation'
      });
    }
    
    // Update subscription in Stripe to not cancel at period end
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false
    });
    
    // Update subscription in database
    subscription.cancelAtPeriodEnd = false;
    await subscription.save();
    
    res.status(200).json({
      success: true,
      message: 'Subscription reactivated successfully',
      subscription: {
        id: subscription._id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
      }
    });
  } catch (error) {
    console.error('Error reactivating subscription:', error);
    res.status(500).json({
      success: false,
      message: 'Error reactivating subscription',
      error: error.message
    });
  }
};

// Handle Stripe webhook events
exports.handleWebhook = async (req, res) => {
  const signature = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log('Received Stripe webhook event:', event.type);
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// Helper functions for webhook event handling
async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout.session.completed event');
  try {
    // Only process subscription checkouts
    if (session.mode !== 'subscription') {
      console.log('Not a subscription checkout, skipping');
      return;
    }
    
    const { userId, planType } = session.metadata;
    
    if (!userId) {
      console.error('Missing userId in session metadata');
      return;
    }
    
    // Get subscription details
    const subscription = await stripe.subscriptions.retrieve(session.subscription);
    
    // Calculate trial end date (14 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    // Create or update subscription in database
    let subscriptionRecord = await Subscription.findOne({
      userId
    });
    
    if (subscriptionRecord) {
      console.log('Updating existing subscription record');
      
      subscriptionRecord.stripeCustomerId = session.customer;
      subscriptionRecord.stripeSubscriptionId = session.subscription;
      subscriptionRecord.status = subscription.status;
      subscriptionRecord.planType = planType || 'monthly';
      subscriptionRecord.trialEndDate = trialEndDate;
      subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      
      await subscriptionRecord.save();
      console.log('Subscription record updated:', subscriptionRecord._id);
    } else {
      console.log('Creating new subscription record');
      
      subscriptionRecord = await Subscription.create({
        userId,
        stripeCustomerId: session.customer,
        stripeSubscriptionId: session.subscription,
        status: subscription.status,
        planType: planType || 'monthly',
        trialEndDate: trialEndDate,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      });
      
      console.log('New subscription record created:', subscriptionRecord._id);
    }
  } catch (error) {
    console.error('Error handling checkout.session.completed:', error);
    throw error;
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Processing invoice.payment_succeeded event');
  try {
    if (!invoice.subscription) {
      console.log('Invoice not related to a subscription, skipping');
      return;
    }
    
    // Find the subscription in our database
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (!subscriptionRecord) {
      console.error('Subscription not found in database:', invoice.subscription);
      return;
    }
    
    // Get latest subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update subscription in database
    subscriptionRecord.status = subscription.status;
    subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    
    await subscriptionRecord.save();
    console.log('Subscription updated after successful payment:', subscriptionRecord._id);
  } catch (error) {
    console.error('Error handling invoice.payment_succeeded:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice.payment_failed event');
  try {
    if (!invoice.subscription) {
      console.log('Invoice not related to a subscription, skipping');
      return;
    }
    
    // Find the subscription in our database
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: invoice.subscription
    });
    
    if (!subscriptionRecord) {
      console.error('Subscription not found in database:', invoice.subscription);
      return;
    }
    
    // Get latest subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    
    // Update subscription status in database
    subscriptionRecord.status = subscription.status; // Will be 'past_due' or 'unpaid'
    
    await subscriptionRecord.save();
    console.log('Subscription updated after failed payment:', subscriptionRecord._id);
    
    // TODO: Send notification to user about failed payment
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing customer.subscription.updated event');
  try {
    // Find the subscription in our database
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!subscriptionRecord) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }
    
    // Update subscription in database
    subscriptionRecord.status = subscription.status;
    subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    
    await subscriptionRecord.save();
    console.log('Subscription updated after Stripe update:', subscriptionRecord._id);
  } catch (error) {
    console.error('Error handling customer.subscription.updated:', error);
    throw error;
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing customer.subscription.deleted event');
  try {
    // Find the subscription in our database
    const subscriptionRecord = await Subscription.findOne({
      stripeSubscriptionId: subscription.id
    });
    
    if (!subscriptionRecord) {
      console.error('Subscription not found in database:', subscription.id);
      return;
    }
    
    // Update subscription status in database
    subscriptionRecord.status = 'canceled';
    
    await subscriptionRecord.save();
    console.log('Subscription marked as canceled:', subscriptionRecord._id);
  } catch (error) {
    console.error('Error handling customer.subscription.deleted:', error);
    throw error;
  }
}
