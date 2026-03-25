export interface StatisticItem {
  value: string;
  label: string;
  description?: string;
}

export interface FeatureItem {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

export interface TestimonialItem {
  quote: string;
  author: string;
  role: string;
  company: string;
  image: string;
}

export interface CompanyLogo {
  name: string;
  logo: string;
  className?: string;
}

export interface CTASection {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonAction: () => void;
}

export interface NavigationLink {
  label: string;
  href: string;
}

export interface SocialProof {
  companies: CompanyLogo[];
  stats: StatisticItem[];
}

export interface ProcessStep {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}
