// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

// The current database to use.
use("contest");
db.projects.insertMany([
  {
    candidate: "674a1b2c8e9f123456789001", // ObjectId string format
    projectTitle: "Eco-Friendly Mobile Banking App",
    designConcept: "A comprehensive mobile banking application focused on promoting environmental consciousness through digital-first banking solutions. The design emphasizes clean, minimalist interfaces with nature-inspired elements to encourage users to go paperless and make eco-friendly financial choices. Features include carbon footprint tracking for purchases, green investment options, and rewards for sustainable spending habits.",
    colorPalette: "Primary: Forest Green (#2D5A27), Secondary: Sky Blue (#87CEEB), Accent: Warm Gold (#FFD700). The green represents nature and growth, blue symbolizes trust and stability, while gold adds a premium feel. Background uses soft earth tones (#F5F5DC) to create a calming, natural atmosphere.",
    inspiration: "Inspired by Scandinavian design principles and the growing environmental awareness among millennials and Gen Z. Drew inspiration from successful fintech apps like Mint and Acorns, but with a unique focus on sustainability. The design also takes cues from nature photography and organic shapes found in leaves and flowing water.",
    primaryFileUrl: "https://dribbble.com/shots/eco-banking-mobile-app.png",
    mockupUrl: "https://dribbble.com/shots/eco-banking-mockup-collection.png",
    status: "submitted",
    submittedAt: new Date("2024-01-15T10:30:00Z"),
    vote: 0,
    feedback: ""
  },
  
  {
    candidate: "674a1b2c8e9f123456789002",
    projectTitle: "AI-Powered Fitness Coaching Dashboard",
    designConcept: "An intelligent fitness dashboard that uses AI to provide personalized workout recommendations and real-time form corrections. The interface combines data visualization with motivational elements, featuring progress tracking, social challenges, and adaptive workout plans. The design focuses on creating an engaging yet professional experience that appeals to both fitness enthusiasts and beginners.",
    colorPalette: "Primary: Electric Blue (#0066FF), Secondary: Energetic Orange (#FF6600), Neutral: Charcoal Gray (#333333). Blue represents trust and technology, orange adds energy and motivation, while gray provides professional balance. Gradients from blue to purple (#6600CC) create dynamic backgrounds for charts and progress indicators.",
    inspiration: "Influenced by Nike Training Club and Peloton's interface design, focusing on motivation and achievement. The data visualization draws inspiration from Apple Health and Fitbit dashboards. Color scheme inspired by modern sports brands and the energy of athletic environments, combined with the sleek aesthetics of high-end fitness equipment.",
    primaryFileUrl: "https://behance.net/gallery/ai-fitness-dashboard.jpg",
    mockupUrl: "https://behance.net/gallery/fitness-app-screens.jpg",
    status: "submitted",
    submittedAt: new Date("2024-01-16T14:45:00Z"),
    vote: 0,
    feedback: ""
  },
  
  {
    candidate: "674a1b2c8e9f123456789003",
    projectTitle: "Virtual Reality Learning Platform",
    designConcept: "An immersive VR educational platform designed for K-12 students, featuring virtual field trips, interactive science experiments, and collaborative learning spaces. The 3D interface prioritizes intuitive navigation and accessibility, with adaptive content that adjusts to different learning styles. The design includes gamification elements to maintain engagement while ensuring educational content remains the focus.",
    colorPalette: "Primary: Deep Purple (#663399), Secondary: Bright Cyan (#00FFFF), Accent: Sunset Orange (#FF4500). Purple conveys creativity and imagination, cyan represents technology and innovation, while orange adds excitement and energy. Soft pastels (#E6E6FA, #F0FFFF) are used for backgrounds to reduce eye strain during extended VR sessions.",
    inspiration: "Inspired by popular educational platforms like Khan Academy and Coursera, but reimagined for VR environments. Drew from successful VR experiences like Google Earth VR and Tilt Brush for spatial navigation concepts. The visual style combines elements from children's educational content with professional e-learning platforms, creating an age-appropriate yet sophisticated interface.",
    primaryFileUrl: "https://dribbble.com/shots/vr-education-interface.png",
    mockupUrl: "https://dribbble.com/shots/vr-learning-mockups.png",
    status: "submitted",
    submittedAt: new Date("2024-01-17T09:15:00Z"),
    vote: 0,
    feedback: ""
  },
  
  {
    candidate: "674a1b2c8e9f123456789004",
    projectTitle: "Smart Home Automation Control Center",
    designConcept: "A centralized control interface for smart home devices, featuring intuitive room-based navigation and automated scheduling. The design emphasizes visual feedback and real-time status updates for all connected devices. The interface includes energy consumption monitoring, security system integration, and family member access controls, all wrapped in a modern, user-friendly design that works across multiple device types.",
    colorPalette: "Primary: Midnight Blue (#191970), Secondary: Warm White (#FAFAFA), Accent: Electric Green (#00FF00). The dark blue provides a sophisticated, tech-forward feel while being easy on the eyes, white ensures excellent readability, and green indicates active/connected status. Subtle gradients and shadows create depth without overwhelming the interface.",
    inspiration: "Influenced by Tesla's vehicle interface and Apple's HomeKit design philosophy. Drew inspiration from premium smart home brands like Nest and Philips Hue for their clean, functional aesthetics. The overall design language takes cues from modern architecture and minimalist interior design, reflecting the sophisticated environments where smart home technology is typically deployed.",
    primaryFileUrl: "https://behance.net/gallery/smart-home-dashboard.jpg",
    mockupUrl: "https://behance.net/gallery/smart-home-app-mockup.jpg",
    status: "submitted",
    submittedAt: new Date("2024-01-18T16:20:00Z"),
    vote: 0,
    feedback: ""
  },
  
  {
    candidate: "674a1b2c8e9f123456789005",
    projectTitle: "Sustainable Fashion Marketplace",
    designConcept: "An e-commerce platform dedicated to sustainable and ethical fashion brands, featuring detailed sustainability scores, brand story integration, and circular economy features like clothing rental and resale options. The design emphasizes transparency, authenticity, and environmental impact while maintaining the visual appeal expected in fashion retail. Includes virtual try-on capabilities and community features for fashion enthusiasts.",
    colorPalette: "Primary: Sage Green (#9CAF88), Secondary: Cream (#FFFDD0), Accent: Terracotta (#E2725B). Sage green represents sustainability and natural materials, cream provides warmth and elegance, while terracotta adds earthiness and authenticity. Rich browns (#8B4513) and soft beiges create depth and reference natural, organic materials used in sustainable fashion.",
    inspiration: "Inspired by successful sustainable brands like Patagonia and Everlane, focusing on transparency and storytelling. The visual design draws from organic, hand-crafted aesthetics while maintaining the polish needed for luxury fashion retail. Influenced by Scandinavian design principles and the Japanese concept of wabi-sabi, celebrating imperfection and authenticity in both design and fashion philosophy.",
    primaryFileUrl: "https://dribbble.com/shots/sustainable-fashion-platform.png",
    mockupUrl: "https://dribbble.com/shots/fashion-marketplace-screens.png",
    status: "submitted",
    submittedAt: new Date("2024-01-19T11:00:00Z"),
    vote: 0,
    feedback: ""
  }
]);

// Verify the insertion
print("Projects seeded successfully!");
print("Total projects in collection: " + db.projects.countDocuments());

// Display the seeded projects with basic info
print("\n--- Seeded Projects Summary ---");
db.projects.find({}, {
  projectTitle: 1,
  candidate: 1,
  status: 1,
  submittedAt: 1,
  vote: 1
}).forEach(function(project) {
  print("• " + project.projectTitle + " (Candidate: " + project.candidate + ", Status: " + project.status + ")");
});

// Optional: Create indexes for better performance
db.projects.createIndex({ "candidate": 1, "submittedAt": -1 });
db.projects.createIndex({ "status": 1 });
db.projects.createIndex({ "vote": -1 }); // For voting leaderboard

print("\nIndexes created for optimal query performance!");

// Sample queries you can run after seeding:

// 1. Find all submitted projects
print("\n--- All Submitted Projects ---");
db.projects.find({ status: "submitted" }, { projectTitle: 1, vote: 1 });

// 2. Find projects by specific candidate
// db.projects.find({ candidate: "674a1b2c8e9f123456789001" });

// 3. Sort projects by vote count (for leaderboard)
// db.projects.find({ status: "submitted" }).sort({ vote: -1 });

// 4. Update vote count for a project (example)
// db.projects.updateOne(
//   { _id: ObjectId("PROJECT_ID_HERE") },
//   { $inc: { vote: 1 } }
// );

// 5. Add feedback to a project
// db.projects.updateOne(
//   { _id: ObjectId("PROJECT_ID_HERE") },
//   { $set: { feedback: "Great use of colors and excellent user experience flow!" } }
// );