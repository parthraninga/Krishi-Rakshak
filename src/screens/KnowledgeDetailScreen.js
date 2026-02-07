import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ChevronLeftIcon,
  SeedsIcon,
  FertilizerIcon,
  PesticideIcon,
  WheatIcon,
} from '../components/Icons';

const KNOWLEDGE_TOPICS = {
  seeds: {
    title: 'Seeds',
    iconColor: '#8D6E63',
    Icon: SeedsIcon,
    intro:
      'Quality seeds are the foundation of a good harvest. Choosing the right seed type, variety, and source can significantly improve yield and crop health.',
    sections: [
      {
        heading: 'Types of seeds',
        body: '**Open-pollinated (OP)** seeds produce plants similar to the parent and can be saved for the next season. **Hybrid (F1)** seeds offer higher yield and uniformity but need to be bought fresh each time. **Certified seeds** are quality-assured for germination, purity, and disease-free status—prefer these for important crops.',
      },
      {
        heading: 'Selecting the right seed',
        body: 'Match the variety to your soil, climate, and water availability. Check the pack for germination percentage (aim for 80%+), seed treatment (e.g. fungicide), and expiry. Buy from trusted dealers or KrishiRakshak partner brands to avoid spurious seeds.',
      },
      {
        heading: 'Storage and handling',
        body: 'Store seeds in a cool, dry place away from direct sunlight and moisture. Keep in sealed bags or containers to avoid pest damage. Do not use seeds past their validity date. Handle gently to avoid mechanical damage before sowing.',
      },
      {
        heading: 'Sowing best practices',
        body: 'Follow recommended seed rate and spacing for the crop. Treat seeds with recommended fungicide or bio-agents if advised. Sow at the right depth and time for your region. Good seed-to-soil contact and adequate moisture after sowing improve germination.',
      },
    ],
  },
  fertilizers: {
    title: 'Fertilizers',
    iconColor: '#1565C0',
    Icon: FertilizerIcon,
    intro:
      'Fertilizers supply essential nutrients to the soil and plants. Using the right type, dose, and timing improves crop growth, yield, and quality while avoiding waste and environmental harm.',
    sections: [
      {
        heading: 'Major nutrients (NPK)',
        body: '**Nitrogen (N)** promotes leafy growth and green colour. **Phosphorus (P)** supports root development, flowering, and seed formation. **Potassium (K)** improves stress tolerance, quality, and shelf life. Soil testing helps decide how much of each to apply.',
      },
      {
        heading: 'Types of fertilizers',
        body: '**Urea, DAP, MOP** are common chemical fertilizers. **Water-soluble fertilizers** are used for fertigation and foliar spray for quick uptake. **Bio-fertilizers** use beneficial microbes to fix nitrogen or solubilize phosphorus. **Micronutrients** (zinc, iron, boron, etc.) are needed in small amounts but are critical for plant health.',
      },
      {
        heading: 'When and how to apply',
        body: 'Split nitrogen application (basal + top dressing) reduces loss and improves efficiency. Apply phosphorus and potassium as per soil test; often at sowing or in splits. Foliar sprays are useful for micronutrients and during stress. Always follow recommended doses and avoid overuse.',
      },
      {
        heading: 'Balanced nutrition',
        body: 'Balance chemical fertilizers with organic manures and compost where possible. Overuse of only N or only NPK can cause nutrient imbalance and soil degradation. Rotate crops and use green manure to maintain soil health.',
      },
    ],
  },
  cropProtection: {
    title: 'Crop Protection',
    iconColor: '#558B2F',
    Icon: PesticideIcon,
    intro:
      'Crop protection includes managing pests, diseases, and weeds through safe and effective use of insecticides, fungicides, and herbicides, along with integrated practices.',
    sections: [
      {
        heading: 'Pests, diseases & weeds',
        body: '**Insect pests** damage leaves, stems, and grains—control with insecticides when needed. **Fungal and bacterial diseases** can be prevented or treated with fungicides. **Weeds** compete for nutrients and water—herbicides or mechanical weeding help. Correct identification is the first step to choosing the right product.',
      },
      {
        heading: 'Insecticides & fungicides',
        body: 'Use **insecticides** only when pest population crosses the economic threshold. **Fungicides** work best as preventive or early curative sprays. Choose products registered for your crop and pest/disease. Rotate modes of action to avoid resistance. Follow the label for dose, timing, and safety.',
      },
      {
        heading: 'Herbicides & bio-stimulants',
        body: '**Herbicides** control weeds—pre-emergent (before weed emergence) or post-emergent (after weeds appear). Selective herbicides spare the crop. **Bio-stimulants** support plant vigour and stress tolerance; they complement but do not replace proper pest and disease management.',
      },
      {
        heading: 'Safe and smart use',
        body: 'Wear protective gear during mixing and spraying. Do not eat, drink, or smoke while handling chemicals. Respect waiting period (PHI) before harvest. Store pesticides away from food and water. Prefer integrated pest management (IPM): healthy soil, resistant varieties, and chemicals only when necessary.',
      },
    ],
  },
  cropNutrition: {
    title: 'Crop Nutrition',
    iconColor: '#F9A825',
    Icon: WheatIcon,
    intro:
      'Crop nutrition is about supplying all essential nutrients—macro and micro—in the right form and at the right time so plants can grow healthy and give optimum yield.',
    sections: [
      {
        heading: 'Macro and micro nutrients',
        body: '**Macro nutrients** (N, P, K, sulphur, calcium, magnesium) are needed in larger quantities. **Micro nutrients** (iron, zinc, manganese, boron, molybdenum, copper) are needed in small amounts but are equally important. Deficiency of even one nutrient can limit yield and quality.',
      },
      {
        heading: 'Recognising deficiencies',
        body: 'Yellowing of leaves (often nitrogen), purple or dark green (phosphorus), scorching of leaf edges (potassium), and chlorosis between veins (iron, zinc) are common signs. Soil and tissue testing can confirm deficiencies. Correct with the right fertilizer or foliar spray.',
      },
      {
        heading: 'Foliar feeding',
        body: 'Foliar sprays supply nutrients directly to leaves for quick absorption. They are useful during critical growth stages, stress, or when soil application is inefficient (e.g. micronutrients in alkaline soil). Use recommended doses to avoid leaf burn.',
      },
      {
        heading: 'Soil health and testing',
        body: 'Regular soil testing helps plan fertiliser use and avoid over or under application. Combine with organic matter, crop rotation, and balanced fertilisation to maintain long-term soil health and productivity.',
      },
    ],
  },
};

function renderParagraph(text) {
  const parts = [];
  let remaining = text;
  let key = 0;
  while (remaining.length > 0) {
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/);
    if (boldMatch) {
      const before = remaining.slice(0, boldMatch.index);
      if (before) parts.push(<Text key={key++}>{before}</Text>);
      parts.push(<Text key={key++} style={styles.bold}>{boldMatch[1]}</Text>);
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
    } else {
      parts.push(<Text key={key++}>{remaining}</Text>);
      break;
    }
  }
  return <Text style={styles.sectionBody}>{parts}</Text>;
}

const KnowledgeDetailScreen = ({topic, onBack}) => {
  const insets = useSafeAreaInsets();
  const config = KNOWLEDGE_TOPICS[topic] || KNOWLEDGE_TOPICS.seeds;
  const {title, iconColor, Icon, intro, sections} = config;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      <View style={[styles.header, {paddingTop: Math.max(12, insets.top) + 8}]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeftIcon size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, {paddingBottom: insets.bottom + 24}]}
        showsVerticalScrollIndicator={false}>
        <View style={[styles.heroStrip, {backgroundColor: iconColor}]}>
          <View style={styles.heroIconWrap}>
            <Icon size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>{title}</Text>
          <Text style={styles.heroIntro}>{intro}</Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionHeading}>{section.heading}</Text>
            {renderParagraph(section.body)}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  backBtn: {
    padding: 8,
    marginRight: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  headerRight: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  heroStrip: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroIntro: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2D7D3E',
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '700',
    color: '#333',
  },
});

export default KnowledgeDetailScreen;
export {KNOWLEDGE_TOPICS};
