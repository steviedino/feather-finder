import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Button,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Audio } from 'expo-av';

export default function BirdDetailsScreen({ route, navigation, deleteSighting }) {
  const { bird } = route.params;
  const wikiLink = `https://en.wikipedia.org/wiki/${encodeURIComponent(bird.name)}`;

  const [imageUrl, setImageUrl] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  const [audioUrl, setAudioUrl] = useState(null);
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    fetchImage();
    fetchBirdCall();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const fetchImage = async () => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          bird.name
        )}`
      );
      const data = await res.json();
      if (data.thumbnail?.source) {
        setImageUrl(data.thumbnail.source);
      }
    } catch (err) {
      console.error('Failed to fetch image:', err);
    } finally {
      setLoadingImage(false);
    }
  };

  const fetchBirdCall = async () => {
    const tryQueries = [
      bird.name,
      bird.name.split(' ').slice(1).join(' '),
      bird.name.split(' ')[0],
    ];

    for (let query of tryQueries) {
      try {
        const res = await fetch(
          `https://xeno-canto.org/api/2/recordings?query=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.recordings && data.recordings.length > 0) {
          const audio = `https:${data.recordings[0].file}`;
          setAudioUrl(audio);
          return;
        }
      } catch (err) {
        console.error(`Error fetching audio for "${query}":`, err);
      }
    }

    console.warn(`No bird call found for "${bird.name}" or its fallbacks.`);
  };

  const handlePlayPause = async () => {
    if (!audioUrl) return;

    if (isPlaying) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setIsPlaying(false);
      return;
    }

    const { sound: newSound } = await Audio.Sound.createAsync({ uri: audioUrl });
    setSound(newSound);
    await newSound.playAsync();
    setIsPlaying(true);

    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete Sighting',
      `Are you sure you want to delete ${bird.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSighting(bird);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{bird.name}</Text>
      <Text style={styles.detail}>Spotted: {bird.time}</Text>

      {loadingImage ? (
        <ActivityIndicator style={{ marginVertical: 20 }} />
      ) : imageUrl ? (
        <Image source={{ uri: imageUrl }} style={styles.image} />
      ) : (
        <Text style={{ color: '#777', marginVertical: 20 }}>No image found</Text>
      )}

      <View style={styles.buttonRow}>
        <Button title="📖 Open Wikipedia" onPress={() => Linking.openURL(wikiLink)} />
      </View>

      {audioUrl ? (
        <View style={styles.buttonRow}>
          <Button
            title={isPlaying ? '⏸ Pause Bird Call' : '🔊 Play Bird Call'}
            onPress={handlePlayPause}
            color="#336699"
          />
        </View>
      ) : (
        <Text style={{ color: '#888', marginTop: 15 }}>No bird call available</Text>
      )}

      <View style={styles.buttonRow}>
        <Button
          title="🗑 Delete this sighting"
          onPress={confirmDelete}
          color="#bb3333"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f0f9ff',
    flex: 1,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#004466',
    marginBottom: 20,
  },
  detail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  image: {
    width: '100%',
    height: 200,
    marginVertical: 20,
    borderRadius: 12,
  },
  buttonRow: {
    marginTop: 15,
  },
});
