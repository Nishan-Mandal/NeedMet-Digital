import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import serviceAccount from "../../config/serviceAccountKey.json" with { type: "json" };

initializeApp({
    credential: cert(serviceAccount),
});

const db = getFirestore();


 const services = [
  // ==========================
  // Facebook & Instagram Management
  // ==========================
  {
    serviceId: "SM001",
    title: "Facebook & Instagram Account Management",
    description:
      "Professional Facebook and Instagram management to grow your brand, engage your audience, and increase your online presence.",
    imageUrl: null,

    plans: [
      {
        planId: "SM001-PLAN1",
        name: "Starter-3M",
        description: null,
        tag: "Popular",
        price: 3999,
        duration: "3 Months",
        durationDays: 92,
        imageUrl: [],
        features: [
          {
            icon: "account_circle",
            title: "Profile Creation & Enhancement",
            desc: "Professional profile setup and optimization.",
          },
          {
            icon: "videocam",
            title: "2 Weekly Video Posts",
            desc: "Includes content creation and hashtag research.",
          },
          {
            icon: "post_add",
            title: "3 Weekly Posts",
            desc: "Regular engaging social media posts.",
          },
          {
            icon: "celebration",
            title: "Festival Posts",
            desc: "Ad-hoc festival posts with content and hashtag research.",
          },
          {
            icon: "brush",
            title: "Business Branding",
            desc: "Business logo and tagline creation.",
          },
          {
            icon: "photo",
            title: "Monthly Cover Update",
            desc: "Cover page updated every month.",
          },
          {
            icon: "storefront",
            title: "NeedMet Profile",
            desc: "Free profile creation on the NeedMet platform.",
          },
          {
            icon: "campaign",
            title: "Promo Banner",
            desc: "Promotion on NeedMet App and Website.",
          },
        ],
        isActive: true,
      },
      {
        planId: "SM001-PLAN2",
        name: "Growth-6M",
        description: null,
        tag: "Best Value",
        price: 6999,
        duration: "6 Months",
        durationDays: 184,
        imageUrl: [],
        features: [
          {
            icon: "account_circle",
            title: "Profile Creation & Enhancement",
            desc: "Professional profile setup and optimization.",
          },
          {
            icon: "videocam",
            title: "2 Weekly Video Posts",
            desc: "Includes content creation and hashtag research.",
          },
          {
            icon: "post_add",
            title: "3 Weekly Posts",
            desc: "Regular engaging social media posts.",
          },
          {
            icon: "celebration",
            title: "Festival Posts",
            desc: "Ad-hoc festival posts with content and hashtag research.",
          },
          {
            icon: "brush",
            title: "Business Branding",
            desc: "Business logo and tagline creation.",
          },
          {
            icon: "photo",
            title: "Monthly Cover Update",
            desc: "Cover page updated every month.",
          },
          {
            icon: "storefront",
            title: "NeedMet Profile",
            desc: "Free profile creation on the NeedMet platform.",
          },
          {
            icon: "campaign",
            title: "Promo Banner",
            desc: "Promotion on NeedMet App and Website.",
          },
        ],
        isActive: true,
      },
    ],

    tags: ["Social Media", "Branding"],
    category: "Social Media",
    badge: "POPULAR",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================
  // YouTube Management
  // ==========================
  {
    serviceId: "YT001",
    title: "YouTube Channel Management",
    description:
      "Complete YouTube channel management including setup, branding, content optimization, and audience growth.",
    imageUrl: null,

    plans: [
      {
        planId: "YT001-PLAN1",
        name: "Starter-3M",
        description: null,
        tag: "Popular",
        price: 1999,
        duration: "3 Months",
        durationDays: 92,
        imageUrl: [],
        features: [
          {
            icon: "smart_display",
            title: "Channel Creation",
            desc: "Professional YouTube channel setup.",
          },
          {
            icon: "palette",
            title: "Channel Branding",
            desc: "Logo, banner and description setup.",
          },
          {
            icon: "video_library",
            title: "Weekly Video Uploads",
            desc: "2 edited videos with optimized title and description.",
          },
          {
            icon: "image",
            title: "Thumbnail Design",
            desc: "Custom thumbnail for every video.",
          },
          {
            icon: "tag",
            title: "Keyword Research",
            desc: "SEO keyword and hashtag research.",
          },
          {
            icon: "celebration",
            title: "Festival Videos",
            desc: "Ad-hoc promotional or festival videos.",
          },
          {
            icon: "movie",
            title: "Shorts Optimization",
            desc: "Optimization of YouTube Shorts.",
          },
        ],
        isActive: true,
      },
      {
        planId: "YT001-PLAN2",
        name: "Growth-6M",
        description: null,
        tag: "Best Value",
        price: 2999,
        duration: "6 Months",
        durationDays: 184,
        imageUrl: [],
        features: [
          {
            icon: "smart_display",
            title: "Channel Creation",
            desc: "Professional YouTube channel setup.",
          },
          {
            icon: "palette",
            title: "Channel Branding",
            desc: "Logo, banner and description setup.",
          },
          {
            icon: "video_library",
            title: "Weekly Video Uploads",
            desc: "2 edited videos with optimized title and description.",
          },
          {
            icon: "image",
            title: "Thumbnail Design",
            desc: "Custom thumbnail for every video.",
          },
          {
            icon: "tag",
            title: "Keyword Research",
            desc: "SEO keyword and hashtag research.",
          },
          {
            icon: "celebration",
            title: "Festival Videos",
            desc: "Ad-hoc promotional or festival videos.",
          },
          {
            icon: "movie",
            title: "Shorts Optimization",
            desc: "Optimization of YouTube Shorts.",
          },
        ],
        isActive: true,
      },
    ],

    tags: ["YouTube", "Video Marketing"],
    category: "Digital Marketing",
    badge: "TRENDING",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================
  // Static Website
  // ==========================
  {
    serviceId: "WEB001",
    title: "Static Business Website",
    description:
      "Professional responsive business website suitable for startups and small businesses.",
    imageUrl: null,

    plans: [
      {
        planId: "WEB001-PLAN1",
        name: "Standard",
        description: null,
        tag: "Recommended",
        price: 5499,
        duration: "1 Month",
        durationDays: 30,
        imageUrl: [],
        features: [
          {
            icon: "language",
            title: "Business Website",
            desc: "Up to 5 responsive pages.",
          },
          {
            icon: "dns",
            title: "Domain & Hosting Guidance",
            desc: "Setup assistance.",
          },
          {
            icon: "devices",
            title: "Responsive Design",
            desc: "Optimized for all devices.",
          },
          {
            icon: "speed",
            title: "Fast Loading",
            desc: "Optimized website performance.",
          },
          {
            icon: "brush",
            title: "Logo & Tagline Integration",
            desc: "Business branding included.",
          },
          {
            icon: "chat",
            title: "WhatsApp & Social Integration",
            desc: "Call button and social links.",
          },
          {
            icon: "contact_mail",
            title: "Contact Form",
            desc: "Google Maps and contact form.",
          },
          {
            icon: "edit_document",
            title: "Content Writing",
            desc: "Professional page content.",
          },
          {
            icon: "trending_up",
            title: "Basic SEO",
            desc: "SEO optimization and testing.",
          },
          {
            icon: "support_agent",
            title: "30 Days Support",
            desc: "Basic technical support.",
          },
        ],
        isActive: true,
      },
    ],

    tags: ["Website"],
    category: "Website Development",
    badge: "NEW",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================
  // Dynamic Website
  // ==========================
  {
    serviceId: "WEB002",
    title: "Dynamic Business Website",
    description:
      "Advanced business website with CMS, database integration, and custom functionality.",
    imageUrl: null,

    plans: [
      {
        planId: "WEB002-PLAN1",
        name: "Professional",
        description: null,
        tag: "Best Seller",
        price: 13999,
        duration: "2 Months",
        durationDays: 60,
        imageUrl: [],
        features: [
          {
            icon: "web",
            title: "Custom Website",
            desc: "Dynamic business website.",
          },
          {
            icon: "dns",
            title: "Domain & Hosting Guidance",
            desc: "Setup assistance.",
          },
          {
            icon: "devices",
            title: "Responsive Design",
            desc: "Works on all devices.",
          },
          {
            icon: "dashboard",
            title: "Admin Dashboard",
            desc: "CMS for content management.",
          },
          {
            icon: "storage",
            title: "Database Integration",
            desc: "Dynamic data management.",
          },
          {
            icon: "person",
            title: "Custom Features",
            desc: "Login, booking, inquiry or business features.",
          },
          {
            icon: "chat",
            title: "Business Integrations",
            desc: "WhatsApp, email, social and call integration.",
          },
          {
            icon: "trending_up",
            title: "Advanced SEO",
            desc: "SEO and security optimization.",
          },
          {
            icon: "analytics",
            title: "Testing & Analytics",
            desc: "Performance testing and bug fixes.",
          },
          {
            icon: "support_agent",
            title: "30 Days Support",
            desc: "Technical support and maintenance.",
          },
        ],
        isActive: true,
      },
    ],

    tags: ["Website", "CMS"],
    category: "Website Development",
    badge: "PREMIUM",
    createdAt: new Date(),
    updatedAt: new Date(),
  },

  // ==========================
  // WhatsApp Marketing
  // ==========================
  {
    serviceId: "WM001",
    title: "WhatsApp Marketing Plan",
    description:
      "Professional WhatsApp Business API setup and campaign management for customer engagement.",
    imageUrl: null,

    plans: [
      {
        planId: "WM001-PLAN1",
        name: "Standard",
        description: null,
        tag: "Popular",
        price: 1999,
        duration: null,
        durationDays: null,
        imageUrl: [],
        features: [
          {
            icon: "forum",
            title: "Business API Setup",
            desc: "Official WhatsApp Business API configuration.",
          },
          {
            icon: "verified",
            title: "Verified Profile",
            desc: "Business profile configuration.",
          },
          {
            icon: "description",
            title: "Message Templates",
            desc: "Template creation and approval.",
          },
          {
            icon: "campaign",
            title: "Campaign Management",
            desc: "Campaign setup and scheduling.",
          },
          {
            icon: "smart_toy",
            title: "Automation",
            desc: "Welcome and auto reply messages.",
          },
          {
            icon: "send",
            title: "Broadcast Campaigns",
            desc: "Promotional messages and offers.",
          },
          {
            icon: "analytics",
            title: "Performance Reports",
            desc: "Delivery reports and analytics.",
          },
          {
            icon: "support_agent",
            title: "Technical Support",
            desc: "Campaign optimization support.",
          },
        ],
        isActive: true,
      },
    ],

    tags: ["WhatsApp", "Marketing"],
    category: "Digital Marketing",
    badge: "BUSINESS",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

async function createServicesCollection() {
  try {
    const batch = db.batch();

    services.forEach((service) => {
      const ref = db.collection("services").doc(service.serviceId);
      batch.set(ref, service);
    });

    await batch.commit();

    console.log(` Successfully uploaded ${services.length} services.`);
  } catch (err) {
    console.error(" Error:", err);
  }
}

createServicesCollection();