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
                const documentDirectory = FS.documentDirectory;
                if (documentDirectory) {
                  const collectionDir = `${documentDirectory}collections/${collection.name}/`;
                  await FS.deleteAsync(collectionDir, { idempotent: true });
                }
              }

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
    <View className="flex-1 bg-gray-950">
      <ScrollView className="flex-1 p-6">
        <View className="flex-row justify-between items-center mb-8 mt-6">
          <View>
            <Text className="text-5xl font-bold text-white mb-2">Collections</Text>
            <View className="h-1 w-16 bg-purple-500 rounded-full" />
          </View>
          <TouchableOpacity
            className="bg-blue-600 rounded-xl px-5 py-3 shadow-lg"
            onPress={() => router.push('/')}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-base">+ New</Text>
          </TouchableOpacity>
        </View>

        {collections.length === 0 ? (
          <View className="items-center justify-center mt-32">
            <Text className="text-6xl mb-4">📚</Text>
            <Text className="text-gray-400 text-xl mb-2">No collections yet</Text>
            <Text className="text-gray-500 text-center mb-6 px-8">
              Start building your gallery by creating your first collection
            </Text>
            <TouchableOpacity
              className="bg-purple-600 rounded-2xl px-8 py-4 shadow-lg"
              onPress={() => router.push('/')}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">Create First Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="flex-row flex-wrap -mx-2">
            {collections.map((collection) => (
              <View key={collection.id} className="w-1/2 p-2">
                <TouchableOpacity
                  className="bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-lg"
                  onPress={() => openCollection(collection)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: collection.logo }}
                    className="w-full h-44"
                    resizeMode="cover"
                  />
                  <View className="p-4">
                    <Text className="text-lg font-bold text-white mb-1" numberOfLines={1}>
                      {collection.name}
                    </Text>
                    <View className="bg-gray-800 rounded-full px-3 py-1 self-start">
                      <Text className="text-sm text-purple-400 font-semibold">
                        {collection.images.length} {collection.images.length === 1 ? 'image' : 'images'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  className="absolute top-4 right-4 bg-red-500 rounded-full w-9 h-9 items-center justify-center shadow-lg"
                  onPress={() => deleteCollection(collection.id)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-xl">×</Text>
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
        <View className="flex-1 bg-gray-950">
          <View className="bg-gray-900 p-6 pt-12 border-b border-gray-800">
            <View className="flex-row justify-between items-center">
              <View className="flex-1 mr-4">
                <Text className="text-3xl font-bold text-white mb-2">
                  {selectedCollection?.name}
                </Text>
                <View className="bg-gray-800 rounded-full px-3 py-1 self-start">
                  <Text className="text-purple-400 font-semibold">
                    {selectedCollection?.images.length} {selectedCollection?.images.length === 1 ? 'image' : 'images'}
                  </Text>
                </View>
              </View>
              <View className="flex-row items-center">
                <TouchableOpacity
                  className="bg-blue-600 rounded-xl px-4 py-2 mr-2"
                  onPress={() => {
                    if (selectedCollection) (router as any).push(`/edit/${selectedCollection.id}`);
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold">Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-800 rounded-full w-10 h-10 items-center justify-center"
                  onPress={() => setModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-gray-300 font-bold text-xl">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 p-4 bg-gray-950">
            <View className="flex-row flex-wrap -mx-1">
              {selectedCollection?.images.map((img, index) => (
                <View key={index} className="w-1/2 p-1">
                  <TouchableOpacity 
                    onPress={() => openFullscreen(img)}
                    activeOpacity={0.9}
                  >
                    <View className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                      <Image
                        source={{ uri: img }}
                        className="w-full h-52"
                        resizeMode="cover"
                      />
                    </View>
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
            className="absolute top-12 right-6 z-50 bg-gray-800 rounded-full w-12 h-12 items-center justify-center shadow-lg"
            onPress={closeFullscreen}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-2xl">×</Text>
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