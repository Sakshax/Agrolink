// ─── Course Modules ───────────────────────────────────────────────
export const coursesData = [
  {
    id: 1,
    title_en: "Tractor Engine Basic Maintenance",
    title_hi: "ट्रैक्टर इंजन की बुनियादी मरम्मत",
    progress: 0,
    thumbnailUrl: "/images/tractor.png",
    videoThumbnailUrl: "/images/expert_video.png",
    videoUrl: "https://www.youtube.com/embed/dhTV7UGc15A?si=aj7aiBaQa5yExA9H",
    duration: "12 min",
    lessons: 4,
    difficulty: "Beginner",
    recommendedJobs: [2],
    category: "Machinery",
    instructor: "Ravi Master Mechanic",
    institution: "AgroLink Auto Skills"
  },
  {
    id: 2,
    title_en: "Organic Farming Techniques",
    title_hi: "जैविक खेती तकनीक",
    progress: 0,
    thumbnailUrl: "/images/organic.png",
    videoThumbnailUrl: "/images/organic.png",
    videoUrl: "https://www.youtube.com/embed/2qiNKen-rm0?si=Jq5lUZkn3l-zGNBi",
    duration: "18 min",
    lessons: 6,
    difficulty: "Beginner",
    recommendedJobs: [3],
    category: "Farming",
    instructor: "Dr. Sharma",
    institution: "KVK Pune"
  },
  {
    id: 3,
    title_en: "Irrigation Systems Intro",
    title_hi: "सिंचाई प्रणाली परिचय",
    progress: 0,
    thumbnailUrl: "/images/irrigation.png",
    videoThumbnailUrl: "/images/irrigation.png",
    videoUrl: "https://www.youtube.com/embed/Z9HAy9EYKKs?si=RlgloJIzydL4aNgB",
    duration: "15 min",
    lessons: 5,
    difficulty: "Intermediate",
    recommendedJobs: [3, 4],
    category: "Farming",
    instructor: "Rajesh (Agri-Engineer)",
    institution: "Jal Seva Institute"
  },
  {
    id: 4,
    title_en: "Dairy Farming & Milk Production",
    title_hi: "डेयरी फार्मिंग और दूध उत्पादन",
    progress: 0,
    thumbnailUrl: "/images/dairy.png",
    videoThumbnailUrl: "/images/dairy.png",
    videoUrl: "https://www.youtube.com/embed/8KS3-6APMhs?si=bb7uhXBAmajbm58j",
    duration: "20 min",
    lessons: 7,
    difficulty: "Beginner",
    recommendedJobs: [1],
    category: "Livestock",
    instructor: "Gokul Dairy Experts",
    institution: "National Dairy Co-op"
  },
  {
    id: 5,
    title_en: "Solar Pump Installation & Use",
    title_hi: "सोलर पंप स्थापना और उपयोग",
    progress: 0,
    thumbnailUrl: "/images/solar.png",
    videoThumbnailUrl: "/images/solar.png",
    videoUrl: "https://www.youtube.com/embed/68X8AW2hEQI",
    duration: "14 min",
    lessons: 4,
    difficulty: "Intermediate",
    recommendedJobs: [4],
    category: "Modern Tech",
    instructor: "Amit (Solar Tech)",
    institution: "Saur Urja Kendra"
  },
  {
    id: 6,
    title_en: "Modern Poultry Farming",
    title_hi: "आधुनिक मुर्गी पालन",
    progress: 0,
    thumbnailUrl: "/images/poultry.png",
    videoThumbnailUrl: "/images/poultry.png",
    videoUrl: "https://www.youtube.com/embed/r1t3h-g1rXw",
    duration: "25 min",
    lessons: 5,
    difficulty: "Beginner",
    recommendedJobs: [1],
    category: "Livestock",
    instructor: "Dr. Patil",
    institution: "Vets for Farmers"
  },
  {
    id: 7,
    title_en: "Smart Greenhouse Management",
    title_hi: "स्मार्ट ग्रीनहाउस प्रबंधन",
    progress: 0,
    thumbnailUrl: "/images/poultry.png",
    videoThumbnailUrl: "/images/poultry.png",
    videoUrl: "https://www.youtube.com/embed/2qiNKen-rm0?si=Jq5lUZkn3l-zGNBi",
    duration: "30 min",
    lessons: 8,
    difficulty: "Advanced",
    recommendedJobs: [4, 5],
    category: "Modern Tech",
    instructor: "ICAR Scientists",
    institution: "ICAR New Delhi"
  },
  {
    id: 8,
    title_en: "Hydroponics Basics",
    title_hi: "हाइड्रोपोनिक्स की मूल बातें",
    progress: 0,
    thumbnailUrl: "/images/poultry.png",
    videoThumbnailUrl: "/images/poultry.png",
    videoUrl: "https://www.youtube.com/embed/2qiNKen-rm0?si=Jq5lUZkn3l-zGNBi",
    duration: "22 min",
    lessons: 6,
    difficulty: "Intermediate",
    recommendedJobs: [5],
    category: "Modern Tech",
    instructor: "Prof. Deshmukh",
    institution: "Agri-Tech Institute"
  }
];

// ─── Per-course quiz bank (keyed by course numeric id) ────────────
export const quizzesData = {
  1: {
    courseId: 1,
    moduleTitle_en: "Module 1: Engine Check",
    moduleTitle_hi: "मॉड्यूल 1: इंजन जांच",
    questions: [
      {
        id: "q1",
        question_en: "How often should you check tractor engine oil?",
        question_hi: "ट्रैक्टर के इंजन के तेल की जांच कितनी बार करनी चाहिए?",
        options: [
          { id: "A", text_en: "Every morning before starting", text_hi: "हर सुबह शुरू करने से पहले", isCorrect: true },
          { id: "B", text_en: "Once a month", text_hi: "महीने में एक बार", isCorrect: false },
          { id: "C", text_en: "Only when the engine smokes", text_hi: "केवल जब इंजन धुआं दे", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "What should you do if the engine overheats?",
        question_hi: "अगर इंजन ज़्यादा गर्म हो जाए तो क्या करना चाहिए?",
        options: [
          { id: "A", text_en: "Keep driving faster", text_hi: "और तेज़ चलाते रहें", isCorrect: false },
          { id: "B", text_en: "Stop and let it cool down", text_hi: "रुकें और ठंडा होने दें", isCorrect: true },
          { id: "C", text_en: "Pour cold water on engine immediately", text_hi: "इंजन पर तुरंत ठंडा पानी डालें", isCorrect: false },
        ]
      }
    ]
  },
  2: {
    courseId: 2,
    moduleTitle_en: "Module 2: Organic Soil Prep",
    moduleTitle_hi: "मॉड्यूल 2: जैविक मिट्टी की तैयारी",
    questions: [
      {
        id: "q1",
        question_en: "Which is best for organic soil enrichment?",
        question_hi: "जैविक मिट्टी संवर्धन के लिए सबसे अच्छा क्या है?",
        options: [
          { id: "A", text_en: "Chemical fertilizer", text_hi: "रासायनिक उर्वरक", isCorrect: false },
          { id: "B", text_en: "Vermicompost", text_hi: "वर्मीकम्पोस्ट (केंचुआ खाद)", isCorrect: true },
          { id: "C", text_en: "Pesticides", text_hi: "कीटनाशक", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "What is crop rotation?",
        question_hi: "फसल चक्र क्या है?",
        options: [
          { id: "A", text_en: "Growing the same crop every season", text_hi: "हर मौसम में एक ही फसल उगाना", isCorrect: false },
          { id: "B", text_en: "Alternating different crops each season", text_hi: "हर मौसम में अलग-अलग फसल बदलना", isCorrect: true },
          { id: "C", text_en: "Removing crops from the field", text_hi: "खेत से फसल निकालना", isCorrect: false },
        ]
      }
    ]
  },
  3: {
    courseId: 3,
    moduleTitle_en: "Module 3: Water Management",
    moduleTitle_hi: "मॉड्यूल 3: जल प्रबंधन",
    questions: [
      {
        id: "q1",
        question_en: "What is the main advantage of drip irrigation?",
        question_hi: "ड्रिप सिंचाई का मुख्य लाभ क्या है?",
        options: [
          { id: "A", text_en: "Saves water with precise delivery", text_hi: "सटीक वितरण से पानी बचाता है", isCorrect: true },
          { id: "B", text_en: "Floods the field entirely", text_hi: "पूरे खेत में पानी भर देता है", isCorrect: false },
          { id: "C", text_en: "It is cheaper than rain", text_hi: "यह बारिश से सस्ता है", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "When is the best time to irrigate crops?",
        question_hi: "फसलों की सिंचाई का सबसे अच्छा समय कब है?",
        options: [
          { id: "A", text_en: "During peak afternoon sun", text_hi: "दोपहर की तेज धूप में", isCorrect: false },
          { id: "B", text_en: "Early morning or evening", text_hi: "सुबह जल्दी या शाम को", isCorrect: true },
          { id: "C", text_en: "Only when leaves wilt", text_hi: "केवल जब पत्तियाँ मुरझाएं", isCorrect: false },
        ]
      }
    ]
  },
  4: {
    courseId: 4,
    moduleTitle_en: "Module 4: Dairy Farming",
    moduleTitle_hi: "मॉड्यूल 4: डेयरी फार्मिंग",
    questions: [
      {
        id: "q1",
        question_en: "How many times a day should a cow be milked?",
        question_hi: "गाय को दिन में कितनी बार दूहना चाहिए?",
        options: [
          { id: "A", text_en: "Once a week", text_hi: "हफ्ते में एक बार", isCorrect: false },
          { id: "B", text_en: "Twice a day (morning & evening)", text_hi: "दिन में दो बार (सुबह और शाम)", isCorrect: true },
          { id: "C", text_en: "Only when the udder is full", text_hi: "केवल जब थन भरा हो", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "What is the ideal clean water intake for a dairy cow per day?",
        question_hi: "एक डेयरी गाय को रोज़ कितना साफ पानी चाहिए?",
        options: [
          { id: "A", text_en: "5 litres", text_hi: "5 लीटर", isCorrect: false },
          { id: "B", text_en: "50–80 litres", text_hi: "50-80 लीटर", isCorrect: true },
          { id: "C", text_en: "200 litres", text_hi: "200 लीटर", isCorrect: false },
        ]
      }
    ]
  },
  5: {
    courseId: 5,
    moduleTitle_en: "Module 5: Solar Pump",
    moduleTitle_hi: "मॉड्यूल 5: सोलर पंप",
    questions: [
      {
        id: "q1",
        question_en: "What is the biggest benefit of a solar water pump?",
        question_hi: "सोलर वॉटर पंप का सबसे बड़ा फायदा क्या है?",
        options: [
          { id: "A", text_en: "No electricity or diesel cost", text_hi: "बिजली या डीजल का खर्च नहीं", isCorrect: true },
          { id: "B", text_en: "Works only at night", text_hi: "केवल रात को काम करता है", isCorrect: false },
          { id: "C", text_en: "Needs monthly repairs", text_hi: "हर महीने मरम्मत चाहिए", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "Where should solar panels be placed for maximum output?",
        question_hi: "अधिकतम आउटपुट के लिए सोलर पैनल कहाँ लगाने चाहिए?",
        options: [
          { id: "A", text_en: "Under a tree for shade", text_hi: "पेड़ की छाया में", isCorrect: false },
          { id: "B", text_en: "Facing south with no shade", text_hi: "बिना छाया, दक्षिण दिशा में", isCorrect: true },
          { id: "C", text_en: "Inside a room", text_hi: "कमरे के अंदर", isCorrect: false },
        ]
      }
    ]
  },
  6: {
    courseId: 6,
    moduleTitle_en: "Module 6: Modern Poultry",
    moduleTitle_hi: "मॉड्यूल 6: आधुनिक मुर्गी पालन",
    questions: [
      {
        id: "q1",
        question_en: "What is the ideal temperature for baby chicks (brooding)?",
        question_hi: "नवजात चूजों के लिए आदर्श तापमान क्या है?",
        options: [
          { id: "A", text_en: "20°C", text_hi: "20°C", isCorrect: false },
          { id: "B", text_en: "32-35°C", text_hi: "32-35°C", isCorrect: true },
          { id: "C", text_en: "40°C", text_hi: "40°C", isCorrect: false },
        ]
      },
      {
        id: "q2",
        question_en: "How often should poultry water be changed?",
        question_hi: "मुर्गियों का पानी कितनी बार बदला जाना चाहिए?",
        options: [
          { id: "A", text_en: "Daily", text_hi: "रोजाना", isCorrect: true },
          { id: "B", text_en: "Weekly", text_hi: "साप्ताहिक", isCorrect: false },
          { id: "C", text_en: "Monthly", text_hi: "मासिक", isCorrect: false },
        ]
      }
    ]
  },
  7: {
    courseId: 7,
    moduleTitle_en: "Module 7: Smart Greenhouse",
    moduleTitle_hi: "मॉड्यूल 7: स्मार्ट ग्रीनहाउस",
    questions: [
      {
        id: "q1",
        question_en: "What does a greenhouse primarily control?",
        question_hi: "ग्रीनहाउस मुख्य रूप से क्या नियंत्रित करता है?",
        options: [
          { id: "A", text_en: "Temperature and Humidity", text_hi: "तापमान और आर्द्रता", isCorrect: true },
          { id: "B", text_en: "Soil type", text_hi: "मिट्टी का प्रकार", isCorrect: false },
          { id: "C", text_en: "Wind direction", text_hi: "हवा की दिशा", isCorrect: false },
        ]
      }
    ]
  },
  8: {
    courseId: 8,
    moduleTitle_en: "Module 8: Hydroponics",
    moduleTitle_hi: "मॉड्यूल 8: हाइड्रोपोनिक्स",
    questions: [
      {
        id: "q1",
        question_en: "Does hydroponics use soil?",
        question_hi: "क्या हाइड्रोपोनिक्स मिट्टी का उपयोग करता है?",
        options: [
          { id: "A", text_en: "Yes", text_hi: "हाँ", isCorrect: false },
          { id: "B", text_en: "No, uses water solutions", text_hi: "नहीं, पानी के समाधान का उपयोग करता है", isCorrect: true },
          { id: "C", text_en: "Only in the beginning", text_hi: "केवल शुरुआत में", isCorrect: false },
        ]
      }
    ]
  }
};

// ─── Jobs ─────────────────────────────────────────────────────────
export const jobsData = [
  {
    id: 1,
    title_en: "Safe Cold Storage Delivery",
    title_hi: "सुरक्षित कोल्ड स्टोरेज डिलीवरी",
    location: "Pune Outskirts",
    distance: "12km away",
    salary: "₹15,000 / month",
    type: "Full-time",
    whatsappNumber: "919766802047",
    recommendedCourses: [4, 6]
  },
  {
    id: 2,
    title_en: "Tractor Driver Needed",
    title_hi: "ट्रैक्टर चालक की आवश्यकता",
    location: "Nashik Farms",
    distance: "45km away",
    salary: "₹12,000 / month + Meals",
    type: "Full-time",
    whatsappNumber: "919637222572",
    recommendedCourses: [1]
  },
  {
    id: 3,
    title_en: "Crop Harvesting Assistant",
    title_hi: "फसल कटाई सहायक",
    location: "Local Village",
    distance: "5km away",
    salary: "₹400 / day",
    type: "Daily Wage",
    whatsappNumber: "919637222572",
    recommendedCourses: [2, 3]
  },
  {
    id: 4,
    title_en: "Greenhouse Technician",
    title_hi: "ग्रीनहाउस तकनीशियन",
    location: "Pune Rural",
    distance: "18km away",
    salary: "₹18,000 / month",
    type: "Full-time",
    whatsappNumber: "919766802047",
    recommendedCourses: [5, 7]
  },
  {
    id: 5,
    title_en: "Hydroponics Operator",
    title_hi: "हाइड्रोपोनिक्स ऑपरेटर",
    location: "Mumbai Outskirts",
    distance: "25km away",
    salary: "₹22,000 / month",
    type: "Full-time",
    whatsappNumber: "919766802047",
    recommendedCourses: [7, 8]
  }
];

// ─── Profile ──────────────────────────────────────────────────────
export const profileData = {
  name: "Ram Singh",
  role: "Tractor Specialist",
  avatarInitial: "RS"
};

// ─── Market Prices ────────────────────────────────────────────────
export const marketPrices = [
  { id: 1, crop_en: "Wheat (Lokwan)", crop_hi: "गेहूँ", price: "₹2,275 / qtl", trend: "up" },
  { id: 2, crop_en: "Onion", crop_hi: "प्याज़", price: "₹1,800 / qtl", trend: "down" },
  { id: 3, crop_en: "Soyabean", crop_hi: "सोयाबीन", price: "₹4,600 / qtl", trend: "up" }
];
