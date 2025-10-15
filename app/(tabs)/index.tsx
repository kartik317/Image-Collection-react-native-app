import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, TouchableOpacity, Image, TextInput, ScrollView, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { Platform } from "react-native";
console.log("Platform:", Platform.OS);
console.log("Document directory:", FileSystem.documentDirectory);


export default function Index() {
  const [collectionName, setCollectionName] = useState("");
  const [logo, setLogo] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const router = useRouter();

  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogo(result.assets[0].uri);
    }
  };

  const pickImages = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const saveCollection = async () => {
    if (!collectionName.trim()) {
      Alert.alert('Error', 'Please enter a collection name');
      return;
    }

    if (!logo) {
      Alert.alert('Error', 'Please select a logo');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one image');
      return;
    }

    try {
      const documentDirectory = FileSystem.documentDirectory;

      if (!documentDirectory) {
        Alert.alert('Error', 'File system not available on this device');
        return;
      }

      // Create collection folder
      const collectionDir = `${documentDirectory}collections/${collectionName}/`;
      await FileSystem.makeDirectoryAsync(collectionDir, { intermediates: true });

      // Save logo
      const logoExt = logo.split('.').pop();
      const logoPath = `${collectionDir}logo.${logoExt}`;
      await FileSystem.copyAsync({ from: logo, to: logoPath });

      // Save images
      const savedImagePaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const ext = images[i].split('.').pop();
        const imagePath = `${collectionDir}image_${i}.${ext}`;
        await FileSystem.copyAsync({ from: images[i], to: imagePath });
        savedImagePaths.push(imagePath);
      }

      // Save metadata in AsyncStorage
      const collectionsRaw = await AsyncStorage.getItem('collections');
      const collectionsArray = collectionsRaw ? JSON.parse(collectionsRaw) : [];

      collectionsArray.push({
        id: Date.now().toString(),
        name: collectionName,
        logo: logoPath,
        images: savedImagePaths,
        createdAt: new Date().toISOString(),
      });

      await AsyncStorage.setItem('collections', JSON.stringify(collectionsArray));

      Alert.alert('Success', 'Collection saved successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setCollectionName('');
            setLogo(null);
            setImages([]);
            router.push('/collections');
          },
        },
      ]);
    } catch (error) {
      console.error('Error saving collection:', error);
      Alert.alert('Error', 'Failed to save collection');
    }
  };


  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        <Text className="text-4xl font-bold text-gray-800 mb-8">Create Collection</Text>

        {/* Collection Name */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Collection Name</Text>
          <TextInput
            className="bg-white border-2 border-gray-300 rounded-xl px-4 py-3 text-lg"
            placeholder="Enter collection name"
            value={collectionName}
            onChangeText={setCollectionName}
          />
        </View>

        {/* Logo Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">Collection Logo</Text>
          <TouchableOpacity
            className="bg-blue-500 rounded-xl p-4 items-center"
            onPress={pickLogo}
          >
            <Text className="text-white font-semibold text-lg">
              {logo ? 'Change Logo' : 'Select Logo'}
            </Text>
          </TouchableOpacity>

          {logo && (
            <View className="mt-4 items-center">
              <Image
                source={{ uri: logo }}
                className="w-32 h-32 rounded-xl"
              />
            </View>
          )}
        </View>

        {/* Image Selection */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-700 mb-2">
            Collection Images ({images.length})
          </Text>
          <TouchableOpacity
            className="bg-green-500 rounded-xl p-4 items-center"
            onPress={pickImages}
          >
            <Text className="text-white font-semibold text-lg">Add Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View className="flex-row flex-wrap mt-4">
              {images.map((img, index) => (
                <View key={index} className="w-1/3 p-1">
                  <Image
                    source={{ uri: img }}
                    className="w-full h-24 rounded-lg"
                  />
                  <TouchableOpacity
                    className="absolute top-2 right-2 bg-red-500 rounded-full w-6 h-6 items-center justify-center"
                    onPress={() => removeImage(index)}
                  >
                    <Text className="text-white font-bold">×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Save Button */}
        <TouchableOpacity
          className="bg-purple-600 rounded-xl p-4 items-center mt-4"
          onPress={saveCollection}
        >
          <Text className="text-white font-bold text-xl">Save Collection</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="bg-gray-300 rounded-xl p-4 items-center mt-3 mb-8"
          onPress={() => router.push('/collections')}
        >
          <Text className="text-gray-700 font-semibold text-lg">View Collections</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}