// import{image} from 'expo-image';
// import { Platform,styleSheet}from 'react-native';
// import{ThemedText} from '@components/ThemedText'
// import ParallaxScrollView from '@/components/parallax-ScrollView';
// import{ThemedView} from '@components/ThemedView';
// import{IconSymbol} from ' @/components/ui/icon-symbol';
// import{fonts} from '@constant/theme';
// import { ActivityIndicator, Animated, Modal, ScrollView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View}  from 'react-native-web';
// all nesscsary imports for UI and frontend 


const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday, Thursday",
    "Friday", "Saturday"];
    const DAY_NICKNAMES= ["Sun", "Mon", "Tue", "Wed", "Thurs",
        "Fri", "Sat"]; 
        // days to be displayed on the APP 
        // as well as shortened nicknames 


const Open_Hours_GYM = { 
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

const Open_Hours_SS = { 
0:{ open: "10:00 AM", close: "6:00PM"},
1:{ open: "7:00 AM", close: "9:00PM"},
2:{ open: "7:00 AM", close: "9:00PM"},
3:{ open: "7:00 AM", close: "9:00PM"},
4:{ open: "7:00 AM", close: "9:00PM"},
5:{ open: "7:00 AM", close: "8:00PM"},
5:{ open: "10:00 AM", close: "6:00PM"},
};
// sunday to monday ex 10AM open on Sunday 6pm close
//hard coded structure for specfically the hours tab UI 

const Crowd_Cntrl_Gage= [
    ["Free", "#02f850"],
    ["Lightly Occupied", "#e5e82e"],
    ["Fairly Occupied", "#f69e06"],
    ["Heavily Occupied", "#f24d06"], 
    ["Extremely Occupied", "#fd0606"]
]
// completed now, should display how busy the gym is alongside a corosponding color which progressvely gets more red 


//Helper Functions
function isArcOpen() {
    const now = new Date();
    const h = now.getHours() + now.getMinutes() / 60;
    const {open, close} = Open_Hours[now.getDay()];
    return h >= open && h < close;
}

// Gets crowd data (pct)=percent and determines color
function getCrowd(pct) {
    if (pct == null)
        return {
            label: "Unknown",
            color: "#8a8a8a",
            bar: "#8a8a8a",
            bg: "rgba(255,255,255,0.75)"
        };
    if (pct < 15) {
        return {
            label: "Not Busy",
            color: "#00b303",
            bar: "#00b303",
            bg: "rgba(255,255,255,0.75)"
        }
    };
    if (pct < 35) {
        return {
            label: "A Little Busy",
            color: "#1aff00",
            bar: "#1aff00",
            bg: "rgba(255,255,255,0.75)"
        }
    };
    if (pct < 55) {
        return {
            label: "Somewhat Busy",
            color: "#fffb2a",
            bar: "#fffb2a",
            bg: "rgba(255,255,255,0.75)"
        }
    }
    if (pct < 75){
        return {
            label: "Very Busy",
            color: "#fa9d2c",
            bar: "#fa9d2c",
            bg: "rgba(255,255,255,0.75)"
        }
    };
    return {
        label: "As Busy As It Gets",
        color: "#dc2626",
        bar: "#dc2626",
        bg: "rgba(255,255,255,0.75)"
    };
}

function fmtArcHour(h) {
    if (h == null) {
        return "-";
    }
    const a = h % 24;
    const hasHalf = h % 1 === 0.5;
    const wholeH = Math.floor(a);
    const suffix = a >= 12 ? "PM" : "AM";
    const display = wholeH > 12 ? wholeH - 12 : wholeH === 0 ? 12 : wholeH;
    return `${display}${hasHalf ? ":30" : ""} ${suffix}`;
}

function fmtHour(h) {
    if (h === 0 || h === 24) return "12 AM";
    if (h === 12) return "12 PM";
    return h > 12 ? `${h - 12} PM` : `${h} AM`;
}

function getTimelineSlots() {
    const {open, close} = Open_Hours_GYM[new Date().getDay()];
    const slots = [];
    for (let h = Math.ceil(open); h < Math.min(close, 24); h++) slots.push(h);
    return slots;
}

function emptySchedule() {
    const s = {};
    for (let d = 0; d < 7; d++) s[d] = [];
    return s;
}

// Algorithm to suggest best times to get to ARC
function computeSuggestions(history, schedule, allowEarlyLate = false) {
  const suggestions = [];
  for (let dayIdx = 0; dayIdx < 7; dayIdx++) {
    const { open, close } = ARC_HOURS[dayIdx];
    const arcOpen  = Math.ceil(open);
    const arcClose = Math.min(Math.floor(close), 24);
    const minHour  = allowEarlyLate ? arcOpen      : Math.max(arcOpen + 1, REASONABLE_START);
    const maxHour  = allowEarlyLate ? arcClose - 1 : Math.min(arcClose - 2, REASONABLE_END);
    for (let h = minHour; h <= maxHour; h++) {
      const busy = (schedule[dayIdx] || []).some(b => h >= b.start && h < b.end);
      if (busy) continue;
      const FLOORS = ["ARC Floor 1", "ARC Floor 2"];
      const readings = [];
      history.forEach(({ timestamp, data }) => {
        const d = new Date(timestamp);
        if (d.getDay() !== dayIdx || d.getHours() !== h) return;
        const floors = data.filter(l => FLOORS.includes(l.LocationName) && !l.IsClosed);
        if (!floors.length) return;
        const avg = floors.reduce((s, l) => s + (l.TotalCapacity > 0 ? (l.LastCount / l.TotalCapacity) * 100 : 0), 0) / floors.length;
        readings.push(avg);
      });
      const crowdPct  = readings.length ? readings.reduce((a, b) => a + b, 0) / readings.length : null;
      const baseScore = crowdPct !== null ? 100 - crowdPct : 50;
      const timeBonus = (h >= 9 && h <= 11) || (h >= 14 && h <= 16) ? 5 : 0;
      suggestions.push({ day: dayIdx, hour: h, score: baseScore + timeBonus, crowdPct, readings: readings.length });
    }
  }
  suggestions.sort((a, b) => b.score - a.score);
  return suggestions;
}