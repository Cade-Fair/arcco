import{image} from 'expo-image';
import { Platform,styleSheet}from 'react-native';
import{ThemedText} from '@components/ThemedText'
import ParallaxScrollView from '@/components/parallax-ScrollView';
import{ThemedView} from '@components/ThemedView';
import{IconSymbol} from ' @/components/ui/icon-symbol';
import{fonts} from '@constant/theme';
import { ActivityIndicator, Animated, Modal, ScrollView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View}  from 'react-native-web';
// all nesscsary imports for UI and frontend 


const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday, Thursday",
    "Friday", "Saturday"];
    const DAY_NICKNAMES= ["Sun", "Mon", "Tue", "Wed", "Thurs",
        "Fri", "Sat"]; 
        // days to be displayed on the APP 
        // as well as shortened nicknames 


const Open_Hours = { 
0:{ open: 8, close: 24},
1:{open: 5.5, close: 25},
2:{open: 5.5, close: 25},
3:{open: 5.5, close: 25},
4:{open: 5.5, close: 24},
5:{open: 5.5, close: 24},
6:{open: 8, close: 24},
};
// sunday to monday ex 8am open on sunday close 12:00am 
//general structure for time (ARC Only) 

const Crowd_Cntrl_Gage={
    
}
//incomplete, but should gage the levels based on how busy