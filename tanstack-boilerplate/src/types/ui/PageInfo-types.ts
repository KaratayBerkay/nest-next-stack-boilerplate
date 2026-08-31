export interface PageInfoSection {
  title: string;
  description: string;
}

export interface PageInfoContent {
  title: string;
  description: string;
  sections: PageInfoSection[];
  tips?: string[];
}

export interface PageInfoButtonProps {
  content: PageInfoContent;
  className?: string;
}
