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

// diffrent sections of the arc
const Arc_sections = [{
name: "ARC", locations: [
    "ARC Floor 1", "ARC Floor2", "ARC Olympic Gym", "ARC Courts"],},]

//layout/ general UI colors 
const styles = StyleSheet.create({
    container:{
        flex: 1, backgroundColor: "#000105",
    },
    header:{
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
        paddingHorizontal: 16,
        paddingTop: Platform.OS === "ios" ? 56 :40,
        paddingBottom: 12
    },
    Barsize:{
        flexDirection: "row",
        borderTopWidth :1,
        borderTopColor: "rgba(255,255,255,0.05)",
        backgroundColor: "#080b15", 
        paddingBottom: Platform.OS === "ios" ? 24: 8
    },
    tabs:{
        flex: 1,
        alignItems: "center",
        paddingTop: 10,
        paddingBottom: 4,
        position: "relative",
    },
    sched:{
        paddingVertical: 5,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: "rgba(255,255,255,0.01)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)"
    },
    sched2: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderColor: "rgba(251, 191, 36,.3)",
    },
    overlays:{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    card:{
        backgroundColor: "#0a0f1b",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.05)",
        borderTopRightRadius: 20,
        borderTopLeftRadius: 20,
        maxHeight: "90%",
        flex:1,
        marginTop: "10%" ,
    },
    header2:{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 18,
        borderBottomWidth: 1,
        borderBottomColor: "rgba(255,255,255,0.05)",
    },
    primaryHeader:{
    paddingVertical: 7, 
    paddingHorizontal: 16,
    borderRadius: 8, 
    backgroundColor : "rgba(49, 189, 249, 0.04)",
    borderWidth: 1,
    borderColor:  "rgba(49, 189, 249, 0.04)"
},
secondHeader:{
    paddingVertical: 7, 
    paddingHorizontal:20,
    borderRadius: 8,
    backgroundColor: "rgba(49, 189, 249, 0.04)",
    borderWidth: 1,
    borderColor: "rgba(49, 189, 249, 0.04)"
},
});

//Main Screen that dipslays ARC gym status, crowd level, and usage trends
function StatusScreen({ data, history, loading, error, arcOpen, schedule, setShowSchedule}) {
    //Animated screen fade-in
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (!loading) Animated.timing(fadeAnim, {toValue: 1, duration: 450, useNativeDriver: true}).start();
    }, [loading]);
    
    const locs = data.filter(l => l.FacilityName === "ARC"); //gets only ARC locations
    const openLocs = locs.filter(l => !l.isClosed); //keeps only open locations
    const overallPct = openLocs.length // Calculate average occupancy percentage across all open ARC locations
        ? Math.round(openLocs.reduce((s, l) => s (l.TotalCapacity > 0 ? (l.LastCount / l.TotalCapacity) * 100 : 0), 0) / openLocs.length)
        : 0;
    const crowd = getCrowd(arcOpen ? overallPct : null); //determines crowd level based on occupancy

    // Only show ARC Floor 1 & 2
    const arcFloors = data.filter(l => ["ARC Floor 1", "ARC Floor 2"].includes(l.LocationName));

    const totalBusyBlocks = Object.values(schedule).reduce((s, b) => s + b.length, 0);
    const todaySuggestions = computeSuggestions(history, schedule, false).filter(s => s.day === new Date().getDay());
    const bestToday = todaySuggestions [0];
    // above is computing best times to visit today based on past history and schedule

    if (loading) { // Shows the loading spinner while fetching data
        return (
            <View style={{flex: 1, alignItems: "center", justifyContent: "center", gap: 14}}>
                <ActivityIndicator size="large" color="#38bdf8" />
                <Text style={{ fontSize: 13, color: "#334155" }}>Loading live data..</Text>
            </View>
        );
    }

    return (
        // Main scrollable screen w fade-in animation
        <Animated.ScrollView style={{ flex: 1, opacity: fadeAnim }} contentContainerStyle={{ padding: 16, paddingBottom: 40}}> 
            {/*Best time banner to display best time to visit based on data*/} 
            {totalBusyBlocks > 0 && bestToday && (
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(56,189,248,.07)", borderWidth: 1, borderColor: "rgba(56,189,248,.2)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
                    <View style={{ flexDirections: "row", alignItems: "center", gap: 8, flex: 1}}>
                        <Text style={{ fontSize: 16 }}>✨</Text>
                        <Text style={{ fontSize: 12, fontWeight: "600", color: "#38bdf8" }}>
                            Best time today:{" "}
                            <Text style={{ color: "#94a3b8", fontWeight: "400" }}>{fmtHour(bestToday.hour)} - {fmtHour(bestToday.hour + 1)}</Text>
                            {bestToday.crowdPct !==null && (
                                <Text style ={{ color: getCrowd(bestToday.crowdPct),color }}> ~{Math.round(bestToday.crowdPct)}% full</Text>
                            )}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowSchedule(true)}>
                        <Text style={{ fontSize: 11, color: "#38bdf8", textDecorationLine: "underline" }}>See all →</Text>
                    </TouchableOpacity>
                    </View>
            )}
            
            {/* Big meter used to display current occupancy percent or closed status*/}
            <View style={{ backgroundColor: arcOpen ? crowd.bg : "rgba(255,255,255,.02)", borderWidth: 1, borderColor: arcOpen ? crowd.color + "28" : "rgba(255,255,255,.05)", borderRadius: 20, padding: 22, marginBottom: 14 }}>
                <View>
                    <View>
                    <Text style={{ fontSize: 10, color: "#334155", letterSpacing: 1.5, marginBottom: 8, textTransform: "uppercase" }}>
                        How busy is the ARC right now?
                    </Text>
                    <Text style={{ fontSize: 52, fontWeight: "800", color: arcOpen ? crowd.color : "#1e293b", lineHeight: 56 }}>
                        {arcOpen ? `${overallPct}%` : "-"}
                    </Text>
                    <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 8, color: arcOpen ? crowd.color : "#334155" }}>
                        {arcOpen ? crowd.label : "Closed Right Now"}
                    </Text>
                </View>
                    <View style={{ alignItems: "flex-end", paddingTop: 4}}>
                        <Text style={{ fontSize: 10, color: "#334155", letterSpacing: 1.2, marginBottom: 4}}>TODAY'S HOURS</Text>
                        <Text style={{ fontSize: 13, color: "#64748b", fontWeight: "500" }}>
                            {fmtArcHour(ARC_HOURS[new Date().getDay()].open)} – {fmtArcHour(ARC_HOURS[new Date().getDay()].close)}
                        </Text>
                    </View>
                </View>
                {arcOpen && <SegmentBar pct={overallPct} color={crowd.bar} />}
                <View style={{ flexDirection: "row", gap: 5, marginTop: 14, flexWrap: "wrap" }}>
                    {CROWD_LEVELS.map(([label, color]) => {
                        const active = crowd.label === label && arcOpen;
                        return (
                            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 3, paddingHorizontal: 9, borderRadius: 20, backgroundColor: active ? color + "18" : "rgba(255,255,255,.02)", borderWidth: 1, borderColor: active ? color + "40" : "rgba(255,255,255,.04)" }}>
                                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: active ? color : "#1e293b" }} />
                                <Text style={{ fontSize: 9, color: active ? color : "#334155" }}>{label}</Text>
                            </View>
                        )
                    })}
                </View>
            </View>

            {/* Timeline to show past data (every 5 mins)*/}
            <View style={{ backgroundColor: "rgba(255,255,255,.02)", borderWidth: 1, borderColor: "rgba(255,255,255,.05)", borderRadius: 16, padding: 16, marginBottom: 16 }}>
                <Text style={{ fontSize: 10, color: "#334155", letterSpacing: 1.5, marginBottom: 12, textTransform: "uppercase" }}>
                    Today's Timeline · {history.length} Snapshot{history.length !== 1 ? "s" : ""} Collected
                </Text>
                <Timeline history={history} />
                {history.length < 2 && (
                    <Text style={{ textAlign: "center", paddingTop: 8, fontSize: 11, color: "#1e293b" }}>Timeline fills in every 5 min as you use the app</Text>
                )}
            </View>


        </Animated.ScrollView>
    );
    
}

export default function APP(){
const[history, setHistory] = useState([]);
const arcOpen = isArcOpen();
const[activeTab, setActiveTab] = useState("Status");
const[shakeSmartHours, setShakeSmartHours] = useState(Open_Hours_SS);
const busyBlocks= <Object.values(schedule).reduce((s,b) => s+b.length, 0);
const[schedule, setSchedule] = useState(emptySchedule);
// return(
//     <View style= {styles.container}>
//         <StatusBar style ="light" />
//         <View style={styles.header}>
//             <View style
}
//incomplete main app going to sleep will finish later and do more searching on best way 
//to display