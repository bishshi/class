export interface PhotoItem {
  title: string;
  caption: string;
  image: string;
  date?: string;
}

export interface PhotoTopic {
  slug: string;
  title: string;
  text: string;
  cover: string;
  photos: PhotoItem[];
}
