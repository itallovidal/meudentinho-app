import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Header } from "@/components/header";
import { Text } from "@/components/ui/text";
import Entypo from "@expo/vector-icons/Entypo";
import AntDesign from "@expo/vector-icons/AntDesign";
import { ArticleCard } from "@/components/articleCard";

export function Index() {
  const categories = ["Higiene Oral", "Dentição", "Alimentação"];

  return (
    <ScrollView className="flex-1 bg-base-100">
      <Header />

      <View className="px-6 py-4 bg-base-200">
        {/* Search */}
        <View className="relative w-full">
          <TextInput
            placeholder="Buscar artigos e guias"
            className="bg-base-100 pr-12 px-4 py-3 rounded-lg"
          />
          <Text className="absolute right-3 top-1/2 -translate-y-1/2 text-base-500 text-2xl">
            ⌕
          </Text>
        </View>

        {/* Category Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4 -mx-6 px-6"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              className="bg-base-100 border border-base-300 px-4 py-2 rounded-lg mr-2"
            >
              <Text className="text-sm">{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Article */}
        <View className="mt-6 w-full rounded-3xl bg-primary-500 px-5 py-6">
          <Text className="text-xs text-base-100/80 mb-2">Destaque</Text>
          <Text variant="h2" className="text-base-100">
            O Guia Completo da Regra dos 6 Anos
          </Text>
          <View className="mt-3 flex-row items-center gap-2">
            <Entypo name="back-in-time" size={16} color="white" />
            <Text className="text-xs text-base-100/80">5 min de leitura</Text>
          </View>
        </View>

        {/* Articles Section */}
        <Text variant="h3" className="my-4">
          Hábitos Orais
        </Text>

        {/* Article Card */}
        <ArticleCard
        category="Higiene Oral"
        imageSrc=""
        title="Respiração Bucal: Sinais de alerta"
        readingTime="5"
        id="2"
        />

        {/* Create Button */}
        <TouchableOpacity className="mt-6 mb-6 bg-primary-500 px-6 py-3 rounded-lg flex-row items-center justify-center gap-2">
          <AntDesign name="plus" size={16} color="white" />
          <Text className="text-white font-semibold">Criar Artigo</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
