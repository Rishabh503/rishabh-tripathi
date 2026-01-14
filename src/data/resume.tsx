import { Icons } from "@/components/icons";
import { HomeIcon, NotebookIcon } from "lucide-react";
import { ReactLight } from "@/components/ui/svgs/reactLight";
import { NextjsIconDark } from "@/components/ui/svgs/nextjsIconDark";
import { Typescript } from "@/components/ui/svgs/typescript";
import { Nodejs } from "@/components/ui/svgs/nodejs";
import { Python } from "@/components/ui/svgs/python";
import { Golang } from "@/components/ui/svgs/golang";
import { Postgresql } from "@/components/ui/svgs/postgresql";
import { Docker } from "@/components/ui/svgs/docker";
import { Kubernetes } from "@/components/ui/svgs/kubernetes";
import { Java } from "@/components/ui/svgs/java";
import { Csharp } from "@/components/ui/svgs/csharp";

export const DATA = {
  name: "Rishabh Tripathi",
  initials: "RT",
  url: "https://rishabhtripathi.vercel.app",
  location: "New Delhi, India",
  locationLink: "https://www.google.com/maps/place/newdelhi",
  description:
    "B.Tech Student & Full-Stack Developer passionate about building AI-powered applications. I love creating intelligent solutions that solve real-world problems.",
  summary:
    "I'm a Computer Science and Technology student at MAIT, Delhi, with a passion for building AI agents and full-stack applications. I specialize in creating intelligent web applications using modern technologies like Next.js, React, and various AI APIs. During my internship at DRDO's Scientific Analysis Group, I developed ML models for cryptographic analysis and built explainable AI systems. I enjoy exploring the intersection of AI and web development, creating tools that make technology more accessible and useful for everyone.",
  avatarUrl: "/image.png",
  skills: [
    { name: "React", icon: ReactLight },
    { name: "Next.js", icon: NextjsIconDark },
    { name: "Typescript", icon: Typescript },
    { name: "Node.js", icon: Nodejs },
    { name: "Python", icon: Python },
    { name: "Java", icon: Java },
    { name: "C++", icon: Csharp },
    { name: "Postgres", icon: Postgresql },
    { name: "MongoDB", icon: Docker },
  ],
  navbar: [
    { href: "/", icon: HomeIcon, label: "Home" },
  ],
  contact: {
    email: "rishabhtripathi2022@gmail.com",
    tel: "+919650594608",
    social: {
      GitHub: {
        name: "GitHub",
        url: "https://github.com/Rishabh503",
        icon: Icons.github,
        navbar: true,
      },
      LinkedIn: {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/rishabh-tripathi-9985aa319/",
        icon: Icons.linkedin,
        navbar: true,
      },
      LeetCode: {
        name: "LeetCode",
        url: "https://leetcode.com/u/Rishabh2906/",
        icon: Icons.globe,
        navbar: true,
      },
      Portfolio: {
        name: "Portfolio",
        url: "https://rishabh-tripathi-xi.vercel.app/",
        icon: Icons.globe,
        navbar: false,
      },
      email: {
        name: "Send Email",
        url: "mailto:rishabhtripathi2022@gmail.com",
        icon: Icons.email,
        navbar: false,
      },
    },
  },

  work: [
    {
      company: "DRDO - Scientific Analysis Group (SAG)",
      href: "https://www.drdo.gov.in/",
      badges: [],
      location: "New Delhi, India",
      title: "Industrial Trainee",
      logoUrl: "/drdo.png",
      start: "July 2025",
      end: "August 2025",
      description:
        "Designed and developed a full-stack web application for cipher file analysis with explainable AI integration. Implemented ML models (Random Forest, XGBoost, Gradient Boosting) achieving up to 64.3% accuracy in distinguishing ciphertext from random sequences. Integrated SHAP for model interpretability, enhancing transparency of cryptographic security analysis. Delivered an end-to-end system contributing to DRDO's cryptanalytic research capabilities.",
    },
  ],
  education: [
    {
      school: "Maharaja Agrasen Institute of Technology",
      href: "https://www.mait.ac.in/",
      degree: "B.Tech - Computer Science and Technology",
      logoUrl: "/mait.png",
      start: "2023",
      end: "2027",
    },
    {
      school: "School Of Excellence",
      href: "#",
      degree: "Senior Secondary (CBSE) - 90.2%",
      logoUrl: "/school.png",
      start: "2021",
      end: "2022",
    },
  ],
  projects: [
    {
      title: "AI Course Generator (Lesson Start)",
      href: "https://freestand-genui.vercel.app/",
      dates: "2024 - Present",
      active: true,
      description:
        "Built an AI-driven lesson generation platform that converts user prompts into complete, structured lessons with validated React UI output. Integrated LangChain, LangGraph, and Gemini to create a multi-step pipeline for prompt analysis, UI generation, code validation, and auto-fixing. Implemented Supabase storage and Clerk authentication for secure, user-specific lesson history.",
      technologies: [
        "Next.js",
        "LangChain",
        "LangGraph",
        "Gemini",
        "Supabase",
        "Clerk",
      ],
      image:'./projects/lessonstart.png',
      links: [
        {
          type: "Website",
          href: "https://freestand-genui.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/freestand-genui",
          icon: <Icons.github className="size-3" />,
        },
      ],
      video: "",
    },
    {
      title: "QuickAI",
      href: "https://quickai-kappa.vercel.app/",
      dates: "2024 - Present",
      active: true,
      description:
        "Built a full-stack AI platform with tools like Resume Analyzer, Blog Generator, YouTube Video Analyzer, Background Remover, and Object Remover using Next.js, React, Tailwind CSS, and AI APIs. Integrated Clerk-based authentication and subscription plans, with Neon PostgreSQL for scalable storage of user data, feature usage, and activity logs.",
      technologies: [
        "Node.js",
        "React",
        "Express",
        "Tailwind CSS",
        "PostgreSQL",
        "Clerk",
        "Neon DB",
      ],
      links: [
        {
          type: "Website",
          href: "https://quickai-kappa.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/quickai",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/quickai.png",
      video: "",
    },
    {
      title: "Tamasha Bhawan",
      href: "https://www.tamashabhawan.com/",
      dates: "2024 - Present",
      active: true,
      description:
        "Tamasha Bhawan is a learning platform where users can buy courses related to music and learn music. Built with modern web technologies to provide an intuitive and engaging learning experience for music enthusiasts.",
      technologies: [
        "Next.js",
        "Prisma",
        "Gemini AI",
        "Clerk",
        "TailwindCSS",
      ],
      links: [
        {
          type: "Website",
          href: "https://www.tamashabhawan.com/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/tamasha-bhwawan-new",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/tamshabhawan.png",
      video: "",
    },
    {
      title: "AI-Powered Expense Tracker",
      href: "https://expense-next-ax96.vercel.app/",
      dates: "2024",
      active: true,
      description:
        "Architected a full-stack AI expense tracker using Next.js, Prisma, and PostgreSQL. Integrated the Google Gemini API to deliver intelligent expense categorization and generate deep, personalized financial insights. Engineered a secure user experience with Clerk authentication and dynamic UI with Tailwind CSS, featuring interactive charts for intuitive data visualization.",
      technologies: [
        "Next.js",
        "Prisma",
        "PostgreSQL",
        "Gemini AI",
        "Clerk",
        "TailwindCSS",
      ],
      links: [
        {
          type: "Website",
          href: "https://expense-next-ax96.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/expenseNext",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/expense.png",
      video: "",
    },
    {
      title: "Internal Marks",
      href: "https://internal-marks-woad.vercel.app/",
      dates: "2024",
      active: true,
      description:
        "Internal marks is a website for students of IPU, where they can input their internal marks and get an idea about how much they need to score in the final exams. Built with React.js and Tailwind CSS for a clean and responsive interface.",
      technologies: ["React.js", "Tailwind CSS"],
      links: [
        {
          type: "Website",
          href: "https://internal-marks-woad.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "http://github.com/Rishabh503/internal-marks",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/internalmarks.png",
      video: "",
    },
    {
      title: "Edunite",
      href: "https://edunite-chi.vercel.app/",
      dates: "2024",
      active: true,
      description:
        "Edunite was a hackathon project built to create an educational platform. Features include course management, user authentication, and a clean interface for students and educators to connect and share knowledge.",
      technologies: [
        "Node.js",
        "React.js",
        "Gemini",
        "Tailwind CSS",
        "MongoDB",
      ],
      links: [
        {
          type: "Website",
          href: "https://edunite-chi.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/edunite",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/edunite.png",
      video: "",
    },
    {
      title: "Workflow",
      href: "https://workflow-nu-hazel.vercel.app/",
      dates: "2024",
      active: true,
      description:
        "Workflow is a project which can be used by users to track their tasks subject to an enhanced todo manager. Built with Next.js, Gemini AI, Tailwind CSS, and MongoDB for intelligent task management and organization.",
      technologies: ["Next.js", "Gemini", "Tailwind CSS", "MongoDB"],
      links: [
        {
          type: "Website",
          href: "https://workflow-nu-hazel.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/workflow",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "./projects/workflow.png",
      video: "",
    },
    {
      title: "Innovave",
      href: "https://innovave-rust.vercel.app/",
      dates: "2024",
      active: true,
      description:
        "Innovave is a basic website built with React.js and Tailwind CSS. It serves as a clean, responsive landing page showcasing modern web design principles and best practices.",
      technologies: ["React.js", "Tailwind CSS"],
      links: [
        {
          type: "Website",
          href: "https://innovave-rust.vercel.app/",
          icon: <Icons.globe className="size-3" />,
        },
        {
          type: "Source",
          href: "https://github.com/Rishabh503/innovave",
          icon: <Icons.github className="size-3" />,
        },
      ],
      image: "",
      video: "",
    },
  ],
  hackathons: [],
} as const;