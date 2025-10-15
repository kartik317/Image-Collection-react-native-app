import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';

const FS = FileSystem as any;

interface Collection {
  id: string;
  name: string;
  logo: string;
  images: string[];
  createdAt: string;
}

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadCollections();
  }, []);

  // Reload when screen is focused so edits are reflected
  useFocusEffect(
    React.useCallback(() => {
      loadCollections();
    }, [])
  );

  const loadCollections = async () => {
    try {
      const collectionsData = await AsyncStorage.getItem('collections');
      if (collectionsData) {
        setCollections(JSON.parse(collectionsData));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const openCollection = (collection: Collection) => {
    setSelectedCollection(collection);
    setModalVisible(true);
  };

  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const openFullscreen = (uri: string) => {
    setFullscreenImage(uri);
  };

  const closeFullscreen = () => setFullscreenImage(null);

  const deleteCollection = async (collectionId: string) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const collection = collections.find(c => c.id === collectionId);
              if (collection) {
                // Delete directory
                const documentDirectory = FS.documentDirectory;
                if (documentDirectory) {
                  const collectionDir = `${documentDirectory}collections/${collection.name}/`;
                  await FS.deleteAsync(collectionDir, { idempotent: true });
                }
              }

              // Update AsyncStorage
              const updatedCollections = collections.filter(c => c.id !== collectionId);
              await AsyncStorage.setItem('collections', JSON.stringify(updatedCollections));
              setCollections(updatedCollections);
            } catch (error) {
              console.error('Error deleting collection:', error);
              Alert.alert('Error', 'Failed to delete collection');
            }
          },
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-6">
          <Text className="text-4xl font-bold text-gray-800">My Collections</Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-lg px-4 py-2"
            onPress={() => router.push('/')}
          >
            <Text className="text-white font-semibold">+ New</Text>
          </TouchableOpacity>
        </View>

        {collections.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <Text className="text-gray-400 text-lg">No collections yet</Text>
            <TouchableOpacity
              className="bg-blue-500 rounded-xl px-6 py-3 mt-4"
              onPress={() => router.push('/')}
            >
              <Text className="text-white font-semibold">Create First Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap">
            {collections.map((collection) => (
              <View key={collection.id} className="w-1/2 p-2">
                <TouchableOpacity
                  className="bg-white rounded-xl overflow-hidden shadow-sm"
                  onPress={() => openCollection(collection)}
                >
                  <Image
                    source={{ uri: collection.logo }}
                    className="w-full h-40"
                    resizeMode="cover"
                  />
                  <View className="p-3">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                      {collection.name}
                    </Text>
                    <Text className="text-sm text-gray-500 mt-1">
                      {collection.images.length} images
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="absolute top-4 right-4 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
                  onPress={() => deleteCollection(collection.id)}
                >
                  <Text className="text-white font-bold text-lg">×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Collection Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-gray-50">
          <View className="bg-white p-6 shadow-sm">
            <View className="flex-row justify-between items-center">
              <Text className="text-3xl font-bold text-gray-800">
                {selectedCollection?.name}
              </Text>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-blue-500 rounded-lg px-3 py-2 mr-2"
                  onPress={() => {
                    if (selectedCollection) (router as any).push(`/edit/${selectedCollection.id}`);
                  }}
                >
                  <Text className="text-white font-semibold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-200 rounded-full w-10 h-10 items-center justify-center"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-gray-600 font-bold text-xl">×</Text>
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-gray-500 mt-2">
              {selectedCollection?.images.length} images
            </Text>
          </View>

          <ScrollView className="flex-1 p-4">
            <View className="flex-row flex-wrap">
              {selectedCollection?.images.map((img, index) => (
                <View key={index} className="w-1/2 p-2">
                  <TouchableOpacity onPress={() => openFullscreen(img)}>
                    <Image
                      source={{ uri: img }}
                      className="w-full h-48 rounded-xl"
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={!!fullscreenImage}
        animationType="fade"
        onRequestClose={closeFullscreen}
        transparent={false}
      >
        <View className="flex-1 bg-black items-center justify-center">
          <TouchableOpacity
            className="absolute top-8 left-4 z-50 bg-gray-200 rounded-full w-10 h-10 items-center justify-center"
            onPress={closeFullscreen}
          >
            <Text className="text-black text-xl">×</Text>
          </TouchableOpacity>

          {fullscreenImage && (
            <Image
              source={{ uri: fullscreenImage }}
              className="w-full h-full"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

export default Collections;