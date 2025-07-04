import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Link } from 'expo-router';

export default function HomePage() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>WatchList</Text>
      <Text style={styles.subtitle}>Gérez votre liste de films, séries et mangas</Text>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => console.log('Naviguer vers l\'accueil')}
        >
          Accueil
        </Button>
        
        <Button 
          mode="outlined" 
          style={styles.button}
          onPress={() => console.log('Naviguer vers les salles')}
        >
          Salles
        </Button>
        
        <Button 
          mode="outlined" 
          style={styles.button}
          onPress={() => console.log('Naviguer vers les paramètres')}
        >
          Paramètres
        </Button>
      </View>
      
      <Text style={styles.info}>
        Serveur backend : http://localhost:3000
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 10,
  },
  button: {
    marginVertical: 5,
  },
  info: {
    marginTop: 30,
    fontSize: 12,
    color: '#999',
  },
});
