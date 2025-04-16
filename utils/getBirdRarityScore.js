const EBIRD_API_KEY = '3hu13svlbn02';

export const getBirdRarityScore = async (birdName, regionCode) => {
  try {
    // Step 1: Get species codes
    const taxonomyRes = await fetch(
      'https://api.ebird.org/v2/ref/taxonomy/ebird?fmt=json',
      {
        headers: {
          'X-eBirdApiToken': EBIRD_API_KEY,
        },
      }
    );
    const taxonomy = await taxonomyRes.json();

    // Step 2: Find species code by matching common name
    const match = taxonomy.find(
      (entry) => entry.comName.toLowerCase() === birdName.toLowerCase()
    );

    if (!match) {
      console.warn(`No species code found for "${birdName}"`);
      return 0;
    }

    const speciesCode = match.speciesCode;
    console.log(`🔍 Found speciesCode "${speciesCode}" for "${birdName}"`);

    // Step 3: Get recent observations for this species in the region
    const obsRes = await fetch(
      `https://api.ebird.org/v2/data/obs/${regionCode}/recent/${speciesCode}`,
      {
        headers: {
          'X-eBirdApiToken': EBIRD_API_KEY,
        },
      }
    );

    const obs = await obsRes.json();
    const frequency = obs.length;
    console.log(`📊 ${birdName} seen ${frequency} times recently in ${regionCode}`);

    // Step 4: Assign a score based on frequency
    if (frequency > 50) return 10;       // Common
    if (frequency > 20) return 30;       // Uncommon
    if (frequency > 5) return 60;        // Rare
    if (frequency > 0) return 100;       // Very rare
    return 250;                          // Never reported = legendary!
  } catch (err) {
    console.error('Rarity scoring error:', err);
    return 0;
  }
};
