import * as Location from 'expo-location';

export const getEbirdRegion = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permission to access location was denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (!geocode || geocode.length === 0) return null;

    const region = geocode[0];
    const countryCode = region.isoCountryCode || 'US';
    const stateCode = region.region || '';

    const ebirdRegion = `${countryCode}-${stateCode}`.toUpperCase();
    console.log('📍 eBird region code:', ebirdRegion);
    return ebirdRegion;
  } catch (err) {
    console.error('Error getting eBird region:', err);
    return null;
  }
};
