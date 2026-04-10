const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Internship = require("./models/internship");
const Application = require("./models/application");

// ─── DATA ────────────────────────────────────────────────────────────────────

const roles = [
  "Frontend Developer Intern",
  "Backend Developer Intern",
  "Full Stack Developer Intern",
  "React Developer Intern",
  "Node.js Developer Intern",
  "Android Developer Intern",
  "iOS Developer Intern",
  "Flutter Developer Intern",
  "Mobile App Developer Intern",
  "Data Analyst Intern",
  "Data Science Intern",
  "Machine Learning Intern",
  "AI Intern",
  "Business Intelligence Intern",
  "IoT Developer Intern",
  "Blockchain Developer Intern",
  "Cyber Security Intern",
  "Cloud Computing Intern",
  "UI/UX Designer Intern",
  "Graphic Designer Intern",
  "Product Designer Intern",
  "Marketing Intern",
  "Digital Marketing Intern",
  "Content Writing Intern",
  "HR Intern",
  "Operations Intern",
  "Business Development Intern",
  "Sales Intern",
  "Software Engineer Intern",
  "QA Tester Intern",
  "DevOps Intern"
];

const workTypes = ["Remote", "Hybrid", "Onsite"];

const locations = [
  "Bangalore", "Hyderabad", "Pune", "Chennai", "Mumbai",
  "Delhi", "Noida", "Gurgaon", "Kolkata", "Ahmedabad",
  "Jaipur", "Chandigarh", "Indore", "Bhopal", "Lucknow",
  "Kanpur", "Nagpur", "Surat", "Vadodara", "Coimbatore",
  "Visakhapatnam", "Patna", "Ranchi", "Bhubaneswar", "Mysore",
  "Trivandrum", "Kochi", "Madurai", "Guwahati", "Dehradun"
];

const companyNames = [
  "NovaTech Labs", "CodeFusion Systems", "PixelEdge Solutions", "ByteCraft Technologies",
  "CloudNova Systems", "DevOrbit Labs", "AlgoNest Technologies", "NextWave Softwares",
  "InnoCore Solutions", "TechHive Systems", "CodeSphere Labs", "DataForge Technologies",
  "SoftPulse Innovations", "LogicWave Systems", "QuantumStack Labs", "BluePeak Technologies",
  "CyberAxis Solutions", "BrightCode Systems", "DevMatrix Labs", "FutureByte Technologies",
  "StackBridge Solutions", "PixelNova Systems", "CloudAxis Technologies", "CodeBlitz Labs",
  "InfiLogic Solutions", "NextGen Codeworks", "SmartStack Labs", "AlphaByte Technologies",
  "DevFusion Systems", "CoreWave Innovations", "TechOrbit Solutions", "ByteNest Labs",
  "DataPulse Systems", "CodeAxis Technologies", "SoftBridge Labs", "QuantumEdge Solutions",
  "PixelStack Technologies", "CloudForge Systems", "DevSpark Labs", "LogicNest Technologies",
  "FutureStack Systems", "CodeHive Innovations", "ByteWave Labs", "InnoStack Technologies",
  "TechBlaze Systems", "DataNest Solutions", "SoftAxis Labs", "NextByte Technologies",
  "CoreNest Systems", "DevPeak Innovations"
];

// ─── ROLE → SKILLS MAP ───────────────────────────────────────────────────────

const roleSkillsMap = {
  "Frontend Developer Intern":       ["HTML", "CSS", "JavaScript", "React", "Bootstrap"],
  "Backend Developer Intern":        ["Node.js", "Express.js", "MongoDB", "REST API", "SQL"],
  "Full Stack Developer Intern":     ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB"],
  "React Developer Intern":          ["React", "JavaScript", "Redux", "HTML", "CSS"],
  "Node.js Developer Intern":        ["Node.js", "Express.js", "MongoDB", "REST API", "JavaScript"],
  "Android Developer Intern":        ["Java", "Kotlin", "Android Studio", "XML", "Firebase"],
  "iOS Developer Intern":            ["Swift", "Xcode", "UIKit", "Objective-C", "Firebase"],
  "Flutter Developer Intern":        ["Flutter", "Dart", "Firebase", "REST API", "Android Studio"],
  "Mobile App Developer Intern":     ["Flutter", "React Native", "Dart", "JavaScript", "Firebase"],
  "Data Analyst Intern":             ["Python", "Excel", "SQL", "Power BI", "Tableau"],
  "Data Science Intern":             ["Python", "Pandas", "NumPy", "Machine Learning", "SQL"],
  "Machine Learning Intern":         ["Python", "TensorFlow", "Scikit-learn", "NumPy", "Pandas"],
  "AI Intern":                       ["Python", "Deep Learning", "TensorFlow", "NLP", "OpenCV"],
  "Business Intelligence Intern":    ["SQL", "Power BI", "Tableau", "Excel", "Python"],
  "IoT Developer Intern":            ["C", "C++", "Arduino", "Raspberry Pi", "MQTT"],
  "Blockchain Developer Intern":     ["Solidity", "Ethereum", "Web3.js", "JavaScript", "Smart Contracts"],
  "Cyber Security Intern":           ["Network Security", "Linux", "Python", "Ethical Hacking", "Wireshark"],
  "Cloud Computing Intern":          ["AWS", "Azure", "Docker", "Kubernetes", "Linux"],
  "UI/UX Designer Intern":           ["Figma", "Adobe XD", "Sketch", "Wireframing", "Prototyping"],
  "Graphic Designer Intern":         ["Adobe Photoshop", "Illustrator", "Canva", "CorelDRAW", "Figma"],
  "Product Designer Intern":         ["Figma", "User Research", "Wireframing", "Prototyping", "Adobe XD"],
  "Marketing Intern":                ["Communication", "Market Research", "MS Office", "Social Media", "Content Creation"],
  "Digital Marketing Intern":        ["SEO", "Google Ads", "Social Media Marketing", "Content Writing", "Analytics"],
  "Content Writing Intern":          ["Content Writing", "SEO", "Research", "MS Word", "Blogging"],
  "HR Intern":                       ["Communication", "MS Office", "Recruitment", "HR Policies", "Excel"],
  "Operations Intern":               ["MS Office", "Excel", "Communication", "Problem Solving", "Logistics"],
  "Business Development Intern":     ["Communication", "Sales", "Market Research", "CRM", "Negotiation"],
  "Sales Intern":                    ["Communication", "Sales", "CRM", "Negotiation", "MS Office"],
  "Software Engineer Intern":        ["Java", "Python", "Data Structures", "Algorithms", "Git"],
  "QA Tester Intern":                ["Manual Testing", "Selenium", "JIRA", "Test Cases", "Automation Testing"],
  "DevOps Intern":                   ["Docker", "Kubernetes", "Jenkins", "Linux", "AWS"]
};

// ─── ROLE → DESCRIPTION MAP ──────────────────────────────────────────────────

const roleDescriptionMap = {
  "Frontend Developer Intern":       "Build responsive and interactive web interfaces using HTML, CSS, and JavaScript frameworks. Collaborate with designers to implement pixel-perfect UI components.",
  "Backend Developer Intern":        "Develop and maintain server-side APIs and database logic. Work with Node.js, Express, and MongoDB to build scalable backend services.",
  "Full Stack Developer Intern":     "Work across the entire web stack — from designing REST APIs to building React frontends. Gain end-to-end product development experience.",
  "React Developer Intern":          "Develop dynamic single-page applications using React.js. Work with state management, component architecture, and API integration.",
  "Node.js Developer Intern":        "Build RESTful APIs and microservices using Node.js and Express. Work with databases and third-party integrations.",
  "Android Developer Intern":        "Design and develop Android applications using Java or Kotlin. Work on UI design, API integration, and app performance optimization.",
  "iOS Developer Intern":            "Develop iOS applications using Swift and Xcode. Collaborate with the product team to deliver high-quality mobile experiences.",
  "Flutter Developer Intern":        "Build cross-platform mobile applications using Flutter and Dart. Work on UI components, state management, and Firebase integration.",
  "Mobile App Developer Intern":     "Develop and maintain mobile applications for Android and iOS. Work with React Native or Flutter to deliver seamless user experiences.",
  "Data Analyst Intern":             "Analyze large datasets to extract actionable insights. Create dashboards and reports using tools like Power BI, Tableau, and Excel.",
  "Data Science Intern":             "Apply statistical and machine learning techniques to solve real-world problems. Work with Python, Pandas, and Scikit-learn on live datasets.",
  "Machine Learning Intern":         "Build and train machine learning models for classification, regression, and clustering tasks. Work with TensorFlow and Scikit-learn.",
  "AI Intern":                       "Research and implement AI solutions including NLP, computer vision, and deep learning. Work on cutting-edge AI projects with real impact.",
  "Business Intelligence Intern":    "Design BI dashboards and reports to support data-driven decision making. Work with SQL, Power BI, and Tableau.",
  "IoT Developer Intern":            "Develop IoT solutions using microcontrollers and communication protocols. Work on hardware-software integration projects.",
  "Blockchain Developer Intern":     "Build decentralized applications and smart contracts on Ethereum. Work with Solidity, Web3.js, and blockchain architecture.",
  "Cyber Security Intern":           "Assist in vulnerability assessments, penetration testing, and security audits. Learn ethical hacking and network security practices.",
  "Cloud Computing Intern":          "Work on cloud infrastructure setup and management using AWS or Azure. Gain hands-on experience with Docker, Kubernetes, and CI/CD pipelines.",
  "UI/UX Designer Intern":           "Design intuitive user interfaces and experiences using Figma and Adobe XD. Conduct user research and create wireframes and prototypes.",
  "Graphic Designer Intern":         "Create visual content including banners, social media graphics, and marketing materials using Adobe Photoshop and Illustrator.",
  "Product Designer Intern":         "Work on end-to-end product design from user research to high-fidelity prototypes. Collaborate with engineering and product teams.",
  "Marketing Intern":                "Assist in planning and executing marketing campaigns. Conduct market research, create content, and analyze campaign performance.",
  "Digital Marketing Intern":        "Manage SEO, Google Ads, and social media campaigns. Analyze digital marketing metrics and optimize for better performance.",
  "Content Writing Intern":          "Write engaging blog posts, articles, and website content. Research topics, optimize for SEO, and maintain brand voice.",
  "HR Intern":                       "Support recruitment processes, onboarding, and HR operations. Assist with job postings, candidate screening, and HR documentation.",
  "Operations Intern":               "Assist in day-to-day operational activities, process optimization, and logistics coordination. Work closely with cross-functional teams.",
  "Business Development Intern":     "Identify new business opportunities, build client relationships, and support the sales pipeline. Work on market research and outreach strategies.",
  "Sales Intern":                    "Support the sales team in lead generation, client outreach, and deal closure. Gain hands-on experience in B2B and B2C sales.",
  "Software Engineer Intern":        "Work on software development projects using Java or Python. Apply data structures, algorithms, and software engineering best practices.",
  "QA Tester Intern":                "Write and execute test cases for web and mobile applications. Work with Selenium and JIRA to track and report bugs.",
  "DevOps Intern":                   "Assist in setting up CI/CD pipelines, containerization with Docker, and cloud deployments. Work on automating infrastructure tasks."
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const pick = (arr, i) => arr[i % arr.length];

const randomStipend = (i) => {
  const options = [0, 3000, 5000, 6000, 7000, 8000, 10000, 12000, 15000, 18000, 20000];
  return options[i % options.length];
};

const randomCGPA = (i) => {
  const options = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0];
  return options[i % options.length];
};

const randomDuration = (i) => {
  return pick(["1 Month", "2 Months", "3 Months", "4 Months", "6 Months"], i);
};

const randomOpenings = (i) => (i % 5) + 1;

const randomGradYear = (i) => pick([2025, 2026, 2027], i);

// ─── SEED ────────────────────────────────────────────────────────────────────

const seedData = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGO_URI);

    await User.deleteMany();
    await Internship.deleteMany();
    await Application.deleteMany();
    console.log("Old data cleared");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // ADMIN
    await User.create({
      name: "Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
      isVerified: true
    });

    // STUDENT
    await User.create({
      name: "Student",
      email: "student@gmail.com",
      password: hashedPassword,
      role: "student"
    });

    // COMPANIES — one per companyName, unique gmail
    const companyDocs = companyNames.map((name, i) => ({
      name,
      email: `${name.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
      password: hashedPassword,
      role: "company",
      isVerified: i % 3 !== 0   // mix of verified and unverified
    }));

    const createdCompanies = await User.insertMany(companyDocs);

    // INTERNSHIPS — one per company, cycling through all roles/locations
    const internships = createdCompanies.map((company, i) => {
      const role = pick(roles, i);
      const location = pick(locations, i);
      const workType = pick(workTypes, i);
      const skills = roleSkillsMap[role] || ["Communication", "MS Office"];
      const description = roleDescriptionMap[role] || "Work on real-world projects and gain hands-on experience.";

      // Each company gets a unique subset of skills (vary by index)
      const skillCount = (i % skills.length) + 1;
      const selectedSkills = skills.slice(0, skillCount);

      return {
        company: company._id,
        title: role,
        location: workType === "Remote" ? "Remote" : location,
        duration: randomDuration(i),
        stipend: randomStipend(i),
        description: `[${workType}] ${description}`,
        requiredSkills: selectedSkills,
        minCGPA: randomCGPA(i),
        graduationYear: randomGradYear(i),
        openings: randomOpenings(i)
      };
    });

    await Internship.insertMany(internships);

    console.log(`✅ Seeded ${createdCompanies.length} companies and ${internships.length} internships`);
    console.log("Admin    → admin@gmail.com    / 123456");
    console.log("Student  → student@gmail.com  / 123456");
    process.exit();

  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
};

seedData();
