import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Text, View, TouchableOpacity, Image, TextInput, ScrollView, Alert } from "react-native";
import { useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

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

      const collectionDir = `${documentDirectory}collections/${collectionName}/`;
      await FileSystem.makeDirectoryAsync(collectionDir, { intermediates: true });

      const logoExt = logo.split('.').pop();
      const logoPath = `${collectionDir}logo.${logoExt}`;
      await FileSystem.copyAsync({ from: logo, to: logoPath });

      const savedImagePaths: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const ext = images[i].split('.').pop();
        const imagePath = `${collectionDir}image_${i}.${ext}`;
        await FileSystem.copyAsync({ from: images[i], to: imagePath });
        savedImagePaths.push(imagePath);
      }

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
    <ScrollView className="flex-1 bg-gray-950">
      <View className="p-6 pt-12">
        {/* Header with Gradient Text Effect */}
        <View className="mb-8">
          <Text className="text-5xl font-bold text-white mb-2">
            Create Collection
          </Text>
          <View className="h-1 w-20 bg-purple-500 rounded-full" />
        </View>

        {/* Collection Name */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
            COLLECTION NAME
          </Text>
          <View className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            <TextInput
              className="px-5 py-4 text-white text-lg"
              placeholder="Enter collection name"
              placeholderTextColor="#6b7280"
              value={collectionName}
              onChangeText={setCollectionName}
            />
          </View>
        </View>

        {/* Logo Selection */}
        <View className="mb-8">
          <Text className="text-base font-semibold text-gray-300 mb-3 tracking-wide">
            COLLECTION LOGO
          </Text>
          
          <TouchableOpacity
            className="bg-blue-600 rounded-2xl p-5 items-center shadow-lg"
            onPress={pickLogo}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">
              {logo ? '✓ Change Logo' : '+ Select Logo'}
            </Text>
          </TouchableOpacity>

          {logo && (
            <View className="mt-6 items-center">
              <View className="bg-gray-900 p-2 rounded-3xl border-2 border-gray-800 shadow-2xl">
                <Image
                  source={{ uri: logo }}
                  className="w-40 h-40 rounded-2xl"
                />
              </View>
            </View>
          )}
        </View>

        {/* Image Selection */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-semibold text-gray-300 tracking-wide">
              COLLECTION IMAGES
            </Text>
            <View className="bg-gray-800 px-4 py-2 rounded-full">
              <Text className="text-purple-400 font-bold text-sm">
                {images.length} {images.length === 1 ? 'image' : 'images'}
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            className="bg-emerald-600 rounded-2xl p-5 items-center shadow-lg"
            onPress={pickImages}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">+ Add Images</Text>
          </TouchableOpacity>

          {images.length > 0 && (
            <View className="flex-row flex-wrap mt-6 -mx-1">
              {images.map((img, index) => (
                <View key={index} className="w-1/3 p-1">
                  <View className="relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800">
                    <Image
                      source={{ uri: img }}
                      className="w-full h-28"
                    />
                    <TouchableOpacity
                      className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center shadow-lg"
                      onPress={() => removeImage(index)}
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-bold text-lg">×</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="space-y-3 mb-8">
          <TouchableOpacity
            className="bg-purple-600 rounded-2xl p-5 items-center shadow-2xl"
            onPress={saveCollection}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-xl">💾 Save Collection</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}