
// Age group data
export const ageGroupData = [
  { name: "18-24", value: 32584, percent: 9 },
  { name: "25-34", value: 98745, percent: 27 },
  { name: "35-44", value: 87452, percent: 24 },
  { name: "45-54", value: 65324, percent: 18 },
  { name: "55-64", value: 52178, percent: 14 },
  { name: "65+", value: 29354, percent: 8 },
];

// Gender data
export const genderData = [
  { name: "Male", value: 189432, color: "#0078D7" },
  { name: "Female", value: 172349, color: "#FF9933" },
  { name: "Non-binary", value: 3856, color: "#019934" },
];

// District data
export const districtData = [
  { name: "North", total: 98432, voted: 45321, turnout: 46.04 },
  { name: "South", total: 87654, voted: 39842, turnout: 45.45 },
  { name: "East", total: 76543, voted: 34567, turnout: 45.16 },
  { name: "West", total: 91234, voted: 42134, turnout: 46.18 },
  { name: "Central", total: 65321, voted: 28123, turnout: 43.05 },
];

// Historical data
export const historicalData = [
  { year: "2010", turnout: 58.7 },
  { year: "2014", turnout: 67.3 },
  { year: "2018", turnout: 63.5 },
  { year: "2023", turnout: 42.8 },
];

// Generate hourly turnout data
export const generateHourlyTurnoutData = () => {
  return Array.from({ length: 11 }, (_, i) => {
    const hour = i + 7; // Starting from 7 AM
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour > 12 ? hour - 12 : hour;
    
    return {
      time: `${hour12}${ampm}`,
      turnout: Math.round(5 + Math.random() * 8),
    };
  });
};
