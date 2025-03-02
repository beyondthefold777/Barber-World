const ENV = {
    development: {
      apiUrl: 'https://barber-world.fly.dev'  // Using production URL
    },
    production: {
      apiUrl: 'https://barber-world.fly.dev'
    }
  };
  
  const getEnvVars = () => {
    if (__DEV__) {
      return ENV.development;
    }
    return ENV.production;
  };
  
  export default getEnvVars();