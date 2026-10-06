export type DepartmentId = "reception" | "hr" | "operations" | "procurement" | "director";

export type Department = {
  id: DepartmentId;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
  actions: string[];
  position: [number, number, number];
  size: [number, number, number];
};

export const departments: Department[] = [
  {
    id: "reception",
    label: "Reception",
    eyebrow: "Welcome",
    title: "Welcome to The Office.",
    body: "This is not a normal website. Walk through the office, meet the departments and discover the company through conversation.",
    actions: ["Start tour", "How does this work?"],
    position: [0, 1.5, 1],
    size: [5, 3, 4],
  },
  {
    id: "hr",
    label: "Human Resources",
    eyebrow: "Careers",
    title: "Looking for your next opportunity?",
    body: "Meet the HR team, learn about the culture and submit your CV even when there is no open vacancy.",
    actions: ["Submit CV", "Life at the company"],
    position: [-5.5, 1.5, -5],
    size: [5, 3, 5],
  },
  {
    id: "operations",
    label: "Operations",
    eyebrow: "Services",
    title: "Where logistics becomes movement.",
    body: "Explore freight, warehousing, customs and last-mile operations from one visual control room.",
    actions: ["Explore services", "View routes"],
    position: [0, 1.5, -7],
    size: [5, 3, 5],
  },
  {
    id: "procurement",
    label: "Procurement",
    eyebrow: "Sourcing",
    title: "What are you looking for?",
    body: "Request products, procurement support or start a supplier conversation from inside the warehouse.",
    actions: ["Request a product", "Become a supplier"],
    position: [5.5, 1.5, -5],
    size: [5, 3, 5],
  },
  {
    id: "director",
    label: "Director's Office",
    eyebrow: "About",
    title: "Meet the story behind the company.",
    body: "Enter the director's office to learn about the company, its vision, values and the people building it.",
    actions: ["Our story", "Our vision"],
    position: [5.5, 1.5, 1],
    size: [5, 3, 4],
  },
];
