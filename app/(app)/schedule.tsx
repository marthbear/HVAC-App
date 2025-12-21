import { useAuth } from "@/src/auth/AuthContext";
import { JOBS } from "@/src/auth/data/jobs";
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ────────────────────────────── */
/* Types */
/* ────────────────────────────── */

type Week = Date[];

/* ────────────────────────────── */
/* Constants */
/* ────────────────────────────── */

const START_HOUR = 0;
const END_HOUR = 23;
const HOUR_HEIGHT = 80;

const SCREEN_WIDTH = Dimensions.get("window").width;
const HORIZONTAL_PADDING = 16;
const CONTENT_WIDTH = SCREEN_WIDTH - HORIZONTAL_PADDING * 2;

/* ────────────────────────────── */
/* Helpers */
/* ────────────────────────────── */

const formatHour = (hour: number) => {
  const period = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${period}`;
};

const getWeekForDate = (date: Date): Week => {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
};

/* ────────────────────────────── */
/* Component */
/* ────────────────────────────── */

export default function ScheduleScreen() {
  const { user } = useAuth();
  if (!user) return null;

  const today = new Date();

  /* Selected day */
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  /* Schedule slide animation */
  const slideX = useRef(new Animated.Value(0)).current;

  /* Date label animation */
  const [displayDate, setDisplayDate] = useState<Date>(today);
  const [incomingDate, setIncomingDate] = useState<Date | null>(null);
  const [isAnimatingDate, setIsAnimatingDate] = useState(false);
  const dateSlide = useRef(new Animated.Value(0)).current;

  /* Weeks for FlatList */
  const weeks = useMemo<Week[]>(() => {
    return Array.from({ length: 25 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + (i - 12) * 7);
      return getWeekForDate(d);
    });
  }, []);

  const INITIAL_INDEX = 12;
  const weekListRef = useRef<FlatList<Week>>(null);

  /* Animate date label */
  const animateDateLabel = (nextDate: Date) => {
    if (nextDate.toDateString() === displayDate.toDateString()) {
      return;
    }

    const direction = nextDate.getTime() > displayDate.getTime() ? 1 : -1;

    setIsAnimatingDate(true);
    setIncomingDate(nextDate);
    dateSlide.setValue(direction * CONTENT_WIDTH);

    Animated.timing(dateSlide, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setDisplayDate(nextDate);
      setIncomingDate(null);
      setIsAnimatingDate(false);
    });
  };

  /* Change selected day */
  const handleDayChange = (nextDate: Date) => {
    if (nextDate.toDateString() === selectedDate.toDateString()) {
      return;
    }

    const direction = nextDate.getTime() > selectedDate.getTime() ? 1 : -1;

    animateDateLabel(nextDate);

    Animated.timing(slideX, {
      toValue: -direction * CONTENT_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(() => {
      setSelectedDate(nextDate);
      slideX.setValue(direction * CONTENT_WIDTH);

      Animated.timing(slideX, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    });
  };

  /* Jump to today */
  const goToToday = () => {
    weekListRef.current?.scrollToIndex({
      index: INITIAL_INDEX,
      animated: true,
    });

    handleDayChange(today);
  };

  /* Jobs for selected day */
  const selectedDateString = selectedDate.toISOString().split("T")[0];

  const filteredJobs = JOBS.filter(
    (job) => job.employeeId === user.id && job.date === selectedDateString
  );

  const hours = Array.from(
    { length: END_HOUR - START_HOUR + 1 },
    (_, i) => START_HOUR + i
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header with Today button */}
      <View style={styles.headerRow}>
        <Text style={styles.header}>Schedule</Text>

        <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
          <Text style={styles.todayText}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Week banner */}
      <FlatList
        ref={weekListRef}
        data={weeks}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={INITIAL_INDEX}
        keyExtractor={(_, index) => index.toString()}
        getItemLayout={(_, index) => ({
          length: CONTENT_WIDTH,
          offset: CONTENT_WIDTH * index,
          index,
        })}
        contentContainerStyle={styles.weekList}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(
            e.nativeEvent.contentOffset.x / CONTENT_WIDTH
          );
          const week = weeks[index];
          handleDayChange(week[selectedDate.getDay()]);
        }}
        renderItem={({ item: week }: { item: Week }) => (
          <View style={styles.weekRow}>
            {week.map((day: Date) => {
              const isSelected =
                day.toDateString() === selectedDate.toDateString();

              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  style={[styles.dayItem, isSelected && styles.dayItemSelected]}
                  onPress={() => handleDayChange(day)}
                >
                  <Text
                    style={[
                      styles.dayLabel,
                      isSelected && styles.dayLabelSelected,
                    ]}
                  >
                    {day.toLocaleDateString("en-US", {
                      weekday: "short",
                    })}
                  </Text>
                  <Text
                    style={[
                      styles.dateLabel,
                      isSelected && styles.dateLabelSelected,
                    ]}
                  >
                    {day.getDate()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      />

      {/* Date label */}
      <View style={styles.dateLabelContainer}>
        {!isAnimatingDate && (
          <Text style={styles.fullDate}>
            {displayDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Text>
        )}

        {incomingDate && (
          <Animated.Text
            style={[
              styles.fullDate,
              styles.incomingDate,
              { transform: [{ translateX: dateSlide }] },
            ]}
          >
            {incomingDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Animated.Text>
        )}
      </View>

      {/* Timeline */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View
          style={[styles.timeline, { transform: [{ translateX: slideX }] }]}
        >
          {hours.map((h) => (
            <View key={h} style={[styles.hourRow, { height: HOUR_HEIGHT }]}>
              <Text style={styles.hourLabel}>{formatHour(h)}</Text>
              <View style={styles.hourLine} />
            </View>
          ))}

          <View style={styles.jobsLayer}>
            {filteredJobs.length === 0 && (
              <Text style={styles.noJobsText}>
                No jobs scheduled for this day.
              </Text>
            )}

            {filteredJobs.map((job) => {
              const top = job.startTime * HOUR_HEIGHT + HOUR_HEIGHT / 2;
              const height = (job.endTime - job.startTime) * HOUR_HEIGHT;

              return (
                <View key={job.id} style={[styles.jobBlock, { top, height }]}>
                  <Text style={styles.jobCustomer}>{job.customerName}</Text>
                  <Text style={styles.jobType}>{job.type}</Text>
                  <Text style={styles.jobTime}>
                    {formatHour(job.startTime)} – {formatHour(job.endTime)}
                  </Text>
                </View>
              );
            })}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ────────────────────────────── */
/* Styles */
/* ────────────────────────────── */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: HORIZONTAL_PADDING,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  header: {
    fontSize: 22,
    fontWeight: "600",
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: "#007AFF",
  },
  todayText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  weekList: {
    paddingVertical: 4,
  },
  weekRow: {
    width: CONTENT_WIDTH,
    flexDirection: "row",
  },

  dayItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10,
    borderRadius: 10,
  },
  dayItemSelected: {
    backgroundColor: "#007AFF",
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginBottom: 2,
  },
  dayLabelSelected: {
    color: "#ffffff",
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#333",
  },
  dateLabelSelected: {
    color: "#ffffff",
  },

  dateLabelContainer: {
    height: 24,
    justifyContent: "center",
    overflow: "hidden",
    marginVertical: 12,
  },
  fullDate: {
    fontSize: 16,
    fontWeight: "600",
  },
  incomingDate: {
    position: "absolute",
    left: 0,
    right: 0,
  },

  scroll: {
    paddingBottom: 40,
  },
  timeline: {
    position: "relative",
    paddingLeft: 64,
  },
  hourRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hourLabel: {
    position: "absolute",
    left: -64,
    width: 56,
    textAlign: "right",
    paddingRight: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#555",
  },
  hourLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e5e5e5",
  },

  jobsLayer: {
    position: "absolute",
    top: 0,
    left: 64,
    right: 0,
  },
  jobBlock: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,122,255,0.35)",
    padding: 8,
  },
  jobCustomer: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "600",
  },
  jobType: {
    color: "#f0f6ff",
    fontSize: 12,
  },
  jobTime: {
    color: "#f0f6ff",
    fontSize: 11,
    marginTop: 4,
  },
  noJobsText: {
    marginTop: 16,
    color: "#666",
  },
});
