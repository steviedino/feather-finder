import React from 'react';
import { View, Button } from 'react-native';
import { Audio } from 'expo-av';

export default function SoundTest() {
  const playSound = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
        { shouldPlay: true }
      );

      console.log('✅ Sound should now be playing');

      sound.setOnPlaybackStatusUpdate((status) => {
        console.log('🎧 Status:', status);
      });
    } catch (err) {
      console.error('❌ Playback error:', err);
    }
  };

  return (
    <View style={{ marginTop: 100 }}>
      <Button title="Play Test Sound" onPress={playSound} />
    </View>
  );
}
