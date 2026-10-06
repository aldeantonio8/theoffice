export type DepartmentId =
  | "reception"
  | "hr"
  | "operations"
  | "procurement"
  | "director"
  | "projects"
  | "meeting";

export type Department = {
  id: DepartmentId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  actions: string[];
  npcName: string;
  npcRole: string;
  greeting: string;
  position: [number, number, number];
  size: [number, number, number];
  npcPosition: [number, number, number];
};

export const departments: Department[] = [
  {
    id: "reception",
    label: "Reception",
    eyebrow: "Welcome",
    title: "Welcome to The Office.",
    body: "This is not a normal website. Walk through the office, meet the departments and discover the company through conversation.",
    actions: ["Start tour", "How does this work?"],
    npcName: "Mia",
    npcRole: "Reception",
    greeting: "Hello! Welcome to The Office. Where would you like to go?",
    position: [0, 0, 2.3],
    size: [5.2, 0, 3.6],
    npcPosition: [0, 0, 1.6],
  },
  {
    id: "hr",
    label: "Human Resources",
    eyebrow: "Careers",
    title: "Looking for your next opportunity?",
    body: "Meet the HR team, learn about the culture and submit your CV even when there is no open vacancy.",
    actions: ["Submit CV", "Life at the company"],
    npcName: "Sara",
    npcRole: "People & Culture",
    greeting: "Hi. Are you looking for an opportunity, or would you like to leave your CV with us?",
    position: [-5.2, 0, -2.3],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -1.8],
  },
  {
    id: "procurement",
    label: "Procurement",
    eyebrow: "Sourcing",
    title: "What are you looking for?",
    body: "Request products, procurement support or start a supplier conversation from inside the warehouse.",
    actions: ["Request a product", "Become a supplier"],
    npcName: "Joel",
    npcRole: "Procurement",
    greeting: "Welcome to Procurement. Tell me what you need and we will help you source it.",
    position: [5.2, 0, -2.3],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -1.8],
  },
  {
    id: "operations",
    label: "Operations",
    eyebrow: "Services",
    title: "Where logistics becomes movement.",
    body: "Explore freight, warehousing, customs and last-mile operations from one visual control room.",
    actions: ["Explore services", "View routes"],
    npcName: "David",
    npcRole: "Operations",
    greeting: "This is Operations. From here we coordinate cargo, routes and delivery.",
    position: [-5.2, 0, -7.4],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -6.8],
  },
  {
    id: "director",
    label: "Director's Office",
    eyebrow: "About",
    title: "Meet the story behind the company.",
    body: "Enter the director's office to learn about the company, its vision, values and the people building it.",
    actions: ["Our story", "Our vision"],
    npcName: "Daniel",
    npcRole: "Managing Director",
    greeting: "Welcome. This office tells the story of why the company exists and where we are going.",
    position: [5.2, 0, -7.4],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -6.8],
  },
  {
    id: "projects",
    label: "Projects Room",
    eyebrow: "Portfolio",
    title: "See the work, not just the promise.",
    body: "The Projects Room turns case studies into physical exhibits. Each project can become a station with visuals, results and a short walkthrough.",
    actions: ["View case studies", "How projects work"],
    npcName: "Amara",
    npcRole: "Project Lead",
    greeting: "This is our project archive. Pick a case and I will show you what was built, how it worked and what changed.",
    position: [-5.2, 0, -12.5],
    size: [5.4, 0, 4.2],
    npcPosition: [-4.2, 0, -11.9],
  },
  {
    id: "meeting",
    label: "Meeting Room",
    eyebrow: "Contact",
    title: "Ready to talk?",
    body: "The Meeting Room is the final stop: a place to start a conversation, request a meeting or leave a project brief.",
    actions: ["Start a conversation", "Book a meeting"],
    npcName: "Noah",
    npcRole: "Client Partner",
    greeting: "Glad you made it here. Tell me what you are building and we can take the conversation forward.",
    position: [5.2, 0, -12.5],
    size: [5.4, 0, 4.2],
    npcPosition: [4.2, 0, -11.9],
  },
];
