import React from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';

export default function SightingsScreen({ sightings, navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Bird Sightings</Text>

      <View style={{ marginBottom: 10 }}>
        <Button
          title="🗺 View Sightings on Map"
          onPress={() => navigation.navigate('Map', { sightings })}
        />
      </View>

      <FlatList
        data={sightings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.detail}>🕒 {item.time}</Text>
            {item.score !== undefined && (
              <Text style={styles.detail}>⭐ Rarity Score: {item.score}</Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
    backgroundColor: '#f0f9ff',
    flex: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 12,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#004466',
  },
  detail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
