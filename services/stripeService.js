const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a customer in Stripe
exports.createCustomer = async (email, name, phone) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      phone
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create a subscription with trial
exports.createSubscription = async (customerId, paymentMethodId, priceId, trialDays = 14) => {
  try {
    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    
    // Set as default payment method
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId
      }
    });
    
    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      expand: ['latest_invoice.payment_intent']
    });
    
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

// Get subscription details
exports.getSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    throw error;
  }
};

// Cancel subscription
exports.cancelSubscription = async (subscriptionId) => {
  try {
    return await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    throw error;
  }
};
