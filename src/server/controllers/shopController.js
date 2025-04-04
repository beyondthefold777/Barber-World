const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Shop = require('../models/shop.model');
const User = require('../models/user.model'); // Adjust path if needed

// Helper function to handle errors
const handleError = (res, error) => {
  console.error('Stripe error:', error);
  return res.status(500).json({
    success: false,
    message: error.message || 'An error occurred with the payment service'
  });
};

// Create a trial subscription
exports.createTrial = async (req, res) => {
  try {
    console.log('Creating trial subscription with data:', req.body);
    const { 
      shopName, 
      ownerName, 
      email, 
      phone, 
      address, 
      numberOfChairs, 
      paymentMethodId 
    } = req.body;

    // Validate required fields
    if (!shopName || !ownerName || !email || !paymentMethodId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Using existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: ownerName,
        phone: phone,
        payment_method: paymentMethodId,
        invoice_settings: {
          default_payment_method: paymentMethodId
        }
      });
      console.log('Created new customer:', customer.id);
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customer.id
    });

    // Create subscription with trial period
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [
        {
          price: process.env.STRIPE_PRICE_ID || 'price_1OqXXXXXXXXXXXXXXXXXXXXX', // Replace with your actual price ID
        },
      ],
      trial_period_days: 14,
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent'],
    });

    console.log('Created subscription with trial:', subscription.id);

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Trial subscription created successfully',
      customerId: customer.id,
      subscriptionId: subscription.id,
      trialEnd: new Date(subscription.trial_end * 1000).toISOString()
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Get subscription details
exports.getSubscription = async (req, res) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;

    // Find shop by user ID
    const shop = await Shop.findOne({ userId: userId });
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // If shop doesn't have subscription info, return placeholder
    if (!shop.stripeCustomerId || !shop.stripeSubscriptionId) {
      return res.status(200).json({
        success: true,
        subscription: {
          status: 'none',
          message: 'No subscription found'
        }
      });
    }

    // Get subscription from Stripe
    const subscription = await stripe.subscriptions.retrieve(shop.stripeSubscriptionId);

    return res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const userId = req.user.id;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'Subscription ID is required'
      });
    }

    // Verify the subscription belongs to this user
    const shop = await Shop.findOne({ userId: userId });
    if (!shop || shop.stripeSubscriptionId !== subscriptionId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this subscription'
      });
    }

    // Cancel at period end instead of immediately
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    return res.status(200).json({
      success: true,
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString()
      }
    });
  } catch (error) {
    return handleError(res, error);
  }
};

// Create payment intent for one-time payments
exports.createPaymentIntent = async (req, res) => {
  try {
    const { amount, currency = 'usd', description } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      description,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    return handleError(res, error);
  }
};
