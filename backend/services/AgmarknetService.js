const axios = require('axios');

class AgmarknetService {
  /**
   * Fetches the real-time mandi price for a given crop.
   * Note: This is an integration mock. In production, this would hit the actual Agmarknet API endpoint 
   * or a local cron-generated cache dictionary.
   */
  static async getMandiPrice(cropName, location) {
    try {
      // Mock logic: generate a static fair price based on string length / char code bounds 
      // representing a hypothetical call out to the gov API
      let basePrice = cropName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      let todayMandiPrice = Math.floor(basePrice / 2); // e.g. "Wheat" -> 250
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      return {
        crop: cropName,
        mandiPrice: todayMandiPrice,
        currency: 'INR',
        unit: 'Quintal',
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Error fetching Agmarknet Pricing:', error);
      throw error;
    }
  }
}

module.exports = AgmarknetService;
