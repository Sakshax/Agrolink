const axios = require('axios');

class AgmarknetAPIService {
  constructor() {
    this.API_KEY = process.env.DATA_GOV_API_KEY || '579b464db66ec23bdd000001cdd394657376430b74040a6b12a8494b';
    this.BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
    this.cache = new Map();
  }

  async getMarketPrice(commodity, state) {
    const cacheKey = `${commodity}-${state}`;
    const now = Date.now();

    // 30 MINUTE CACHE LOGIC
    if (this.cache.has(cacheKey)) {
      const { data, timestamp } = this.cache.get(cacheKey);
      if (now - timestamp < 30 * 60 * 1000) {
        console.log(`[Cache Hit] Agmarknet data for ${cacheKey}`);
        return data;
      }
    }

    try {
      const response = await axios.get(this.BASE_URL, {
        params: {
          'api-key': this.API_KEY,
          format: 'json',
          'filters[commodity]': commodity,
          'filters[state]': state,
          limit: 1 
        }
      });

      const records = response.data.records;
      if (!records || records.length === 0 || response.data.error) {
        console.warn(`[API Fallback] No records found or key unauthorized for ${cacheKey}. Using demo data.`);
        return {
          benchmarkPrice: commodity === 'Wheat' ? 2400 : 3100,
          minPrice: 2000,
          maxPrice: 2600,
          market: "Amritsar (Demo)",
          district: "Amritsar",
          lastUpdated: new Date().toISOString()
        };
      }

      const data = {
        benchmarkPrice: parseFloat(records[0].modal_price),
        minPrice: parseFloat(records[0].min_price),
        maxPrice: parseFloat(records[0].max_price),
        market: records[0].market,
        district: records[0].district,
        lastUpdated: records[0].arrival_date
      };

      this.cache.set(cacheKey, { data, timestamp: now });
      return data;

    } catch (error) {
      console.error('Agmarknet API Error:', error.message);
      return null;
    }
  }
}

module.exports = new AgmarknetAPIService();
