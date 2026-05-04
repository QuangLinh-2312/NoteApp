const cacheService = require('../services/cacheService');

const cache = (keyGenerator, expirationInSeconds = 3600) => {
  return async (req, res, next) => {
    try {
      const key = typeof keyGenerator === 'function' 
        ? keyGenerator(req) 
        : keyGenerator;

      const cachedData = await cacheService.get(key);
      
      if (cachedData) {
        return res.json(cachedData);
      }

      // Store original res.json
      const originalJson = res.json.bind(res);

      // Override res.json
      res.json = (data) => {
        // Cache the data
        cacheService.set(key, data, expirationInSeconds);
        // Call original json
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cache;
