import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const birdData = [
  {
    name: 'Northern Cardinal',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Cardinalis_cardinalis_male.jpg',
    fact: 'Male Northern Cardinals are bright red to attract mates and defend territory.',
  },
  {
    name: 'American Goldfinch',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/American_goldfinch_male_summer.jpg',
    fact: 'Goldfinches change color with the seasons — bright yellow in summer, olive in winter.',
  },
  {
    name: 'Blue Jay',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/04/Cyanocitta-cristata-004.jpg',
    fact: 'Blue Jays can mimic hawk calls to scare away other birds from feeders.',
  },
];

export default function HomeScreen({ navigation, addSighting }) {
  const [imageUri, setImageUri] = useState(null);
  const [labels, setLabels] = useState([]);
  const [selectedBird, setSelectedBird] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [randomBird, setRandomBird] = useState(null);

  useEffect(() => {
    const init = async () => {
      await ImagePicker.requestCameraPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
      const bird = birdData[Math.floor(Math.random() * birdData.length)];
      setRandomBird(bird);
    };

    init();
  }, []);

  const getLevel = () => Math.floor(totalXP / 100) + 1;

  const pickImage = async () => {
    resetAll();
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendImageToServer(uri);
    }
  };

  const takePhoto = async () => {
    resetAll();
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      sendImageToServer(uri);
    }
  };

  const resetAll = () => {
    setLabels([]);
    setSelectedBird(null);
  };

  const sendImageToServer = async (uri) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'bird.jpg',
        type: 'image/jpeg',
      });

      const response = await fetch(
        'https://feather-finder-backend.onrender.com/identify-bird',
        {
          method: 'POST',
          body: formData,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const text = await response.text();
      const data = JSON.parse(text);
      setLabels(data.labels || []);

      if (data.labels?.length > 0) {
        const bestMatch = data.labels[0];
        setSelectedBird(bestMatch);
      }
    } catch (error) {
      console.error('❌ Error sending image:', error);
      Alert.alert('Error', 'Could not send image to server.');
    } finally {
      setLoading(false);
    }
  };

  const confirmSelection = () => {
    const now = new Date().toLocaleString();
    const bird = {
      name: selectedBird.description,
      score: 10, // fixed score (rarity removed)
      time: now,
      coords: null,
    };

    setTotalXP((prevXP) => prevXP + bird.score);
    addSighting(bird);
    Alert.alert('✅ Saved!', `${bird.name} logged with score ${bird.score}`);
  };

  const FancyButton = ({ title, onPress, color = '#6EC6FF' }) => (
    <TouchableOpacity style={[styles.fancyButton, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.fancyButtonText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>🪶 Feather Finder</Text>
        <Text style={styles.xpBar}>🧠 XP: {totalXP} | Level: {getLevel()}</Text>

        {randomBird && (
          <View style={styles.randomBirdCard}>
            <Image source={{ uri: randomBird.image }} style={styles.randomBirdImage} />
            <Text style={styles.randomBirdName}>{randomBird.name}</Text>
            <Text style={styles.randomBirdFact}>{randomBird.fact}</Text>
          </View>
        )}

        {loading && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
        {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        {selectedBird && (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>🎯 Best Match</Text>
            <Text style={styles.bestMatchText}>{selectedBird.description}</Text>
            <FancyButton title="✅ Yes" onPress={confirmSelection} />
            <FancyButton title="❌ No" onPress={() => setSelectedBird(null)} color="#d9534f" />
          </View>
        )}
      </ScrollView>

      <View style={styles.buttonRow}>
        <FancyButton title="📷 Take Photo" onPress={takePhoto} />
        <FancyButton title="🖼 Pick Image" onPress={pickImage} />
        <FancyButton title="📓 View Sightings" onPress={() => navigation.navigate('Sightings')} color="#88C057" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f9ff',
  },
  scroll: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1C313A',
  },
  xpBar: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 15,
    color: '#555',
  },
  randomBirdCard: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  randomBirdImage: {
    width: 220,
    height: 220,
    borderRadius: 10,
    marginBottom: 10,
  },
  randomBirdName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#004466',
    marginBottom: 6,
  },
  randomBirdFact: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 10,
    marginTop: 10,
  },
  resultCard: {
    marginTop: 25,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bestMatchText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#004466',
    marginBottom: 16,
  },
  buttonRow: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  fancyButton: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fancyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
});
